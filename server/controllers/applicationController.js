const {
  prisma,
  JobStatus,
  ApplicationStatus,
  DepositStatus,
  supabase,
  stripeClient,
} = require("../db");

async function createApplication(req, res) {
  try {
    const { jobId, message } = req.body;
    console.log("Application Creation - Request User:", req.user);
    console.log("Application Creation - User type:", typeof req.user);
    console.log(
      "Application Creation - User keys:",
      Object.keys(req.user || {})
    );

    // Use user_id from Supabase user object if available, fallback to id
    const workerId = req.user?.id;

    // Verify the job exists and is in PENDING status
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status !== JobStatus.PENDING) {
      return res.status(400).json({
        error: "job_not_pending",
        message: "Job is not available for application",
      });
    }

    // Check if user already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId,
        workerId,
      },
    });

    if (existingApplication) {
      return res.status(400).json({
        error: "duplicate_application",
        message: "You have already applied for this job",
      });
    }

    // Create $5 deposit PaymentIntent
    // CRITICAL FIX: Use 'metadata' (not 'meta') for Stripe API
    const depositIntent = await stripeClient.paymentIntents.create({
      amount: 500, // $5.00
      currency: "usd",
      capture_method: "manual", // Authorize but don't capture yet
      metadata: {
        // CORRECTED: metadata (not meta)
        jobId,
        applicationId: "temp", // Will update after creating application
        type: "DEPOSIT",
      },
    });

    // Create application record
    console.log("Creating job application with workerId:", workerId);
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        workerId,
        message,
        depositId: depositIntent.id,
        depositStatus: DepositStatus.AUTHORIZED,
        status: ApplicationStatus.APPLIED,
      },
    });
    console.log("Application Creation - Application Data:", application);

    // Update metadata with actual application ID
    // CRITICAL FIX: Use 'metadata' (not 'meta') for Stripe API
    await stripeClient.paymentIntents.update(depositIntent.id, {
      metadata: { applicationId: application.id },
    });

    res.status(201).json(application);
  } catch (error) {
    console.error("Application Creation Error:", error.message);
    res.status(500).json({
      error: "application_creation_failed",
      message: "Failed to create job application",
      details: error.message,
    });
  }
}

async function getApplications(req, res) {
  try {
    const workerId = req.user?.id;

    const applications = await prisma.jobApplication.findMany({
      where: { workerId },
      include: {
        job: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(applications);
  } catch (error) {
    console.error("Get Applications Error:", error.message);
    res.status(500).json({
      error: "applications_retrieval_failed",
      message: "Failed to retrieve applications",
      details: error.message,
    });
  }
}

async function getJobApplications(req, res) {
  try {
    const { jobId } = req.params;
    const workerId = req.user.id;
    const hirerId = req.user.id;

    // Verify the job exists and belongs to the hirer
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.hirerId !== hirerId) {
      return res.status(403).json({
        error: "not_job_owner",
        message: "You don't have permission to view applications for this job",
      });
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobId },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(applications);
  } catch (error) {
    console.error("Get Job Applications Error:", error.message);
    res.status(500).json({
      error: "job_applications_retrieval_failed",
      message: "Failed to retrieve job applications",
      details: error.message,
    });
  }
}

async function acceptApplication(req, res) {
  try {
    const { id } = req.params;

    // Capture the $5 deposit
    const application = await prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.status !== ApplicationStatus.APPLIED) {
      return res.status(400).json({
        error: "invalid_status",
        message: "Application is not in a state that can be accepted",
      });
    }

    // Capture the deposit
    await stripeClient.paymentIntents.capture(application.depositId);

    // Update job status to COMMITTED
    await prisma.job.update({
      where: { id: application.jobId },
      data: { status: JobStatus.COMMITTED },
    });

    // Update application status
    const updatedApplication = await prisma.jobApplication.update({
      where: { id },
      data: {
        status: ApplicationStatus.ACCEPTED,
        depositStatus: DepositStatus.CAPTURED,
      },
    });

    res.json(updatedApplication);
  } catch (error) {
    console.error("Accept Application Error:", error.message);
    res.status(500).json({
      error: "application_accept_failed",
      message: "Failed to accept application",
      details: error.message,
    });
  }
}

async function rejectApplication(req, res) {
  try {
    const { id } = req.params;

    // Get the application
    const application = await prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.status !== ApplicationStatus.APPLIED) {
      return res.status(400).json({
        error: "invalid_status",
        message: "Application is not in a state that can be rejected",
      });
    }

    // Cancel the deposit
    await stripeClient.paymentIntents.cancel(application.depositId);

    // Update application status
    const updatedApplication = await prisma.jobApplication.update({
      where: { id },
      data: {
        status: ApplicationStatus.REJECTED,
        depositStatus: DepositStatus.REFUNDED,
      },
    });

    res.json(updatedApplication);
  } catch (error) {
    console.error("Reject Application Error:", error.message);
    res.status(500).json({
      error: "application_reject_failed",
      message: "Failed to reject application",
      details: error.message,
    });
  }
}

async function confirmApplicationPayment(req, res) {
  try {
    const { id } = req.params;

    // Get the application
    const application = await prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.status !== ApplicationStatus.APPLIED) {
      return res.status(400).json({
        error: "invalid_status",
        message: "Application is not in a state that can be confirmed",
      });
    }

    // Confirm the PaymentIntent with ONLY valid parameters
    const confirmedIntent = await stripeClient.paymentIntents.confirm(
      application.depositId,
      {
        payment_method: "pm_card_visa", // Test card for development
        return_url: "http://localhost:5000/payment-complete", // Required for some payment methods
      }
    );

    // Update application status
    const updatedApplication = await prisma.jobApplication.update({
      where: { id },
      data: {
        depositStatus: DepositStatus.AUTHORIZED,
      },
    });

    res.json(updatedApplication);
  } catch (error) {
    console.error("Confirm Application Payment Error:", error.message);
    res.status(500).json({
      error: "application_payment_confirmation_failed",
      message: "Failed to confirm application payment",
      details: error.message,
    });
  }
}

module.exports = {
  createApplication,
  getApplications,
  getJobApplications,
  acceptApplication,
  rejectApplication,
  confirmApplicationPayment,
};
