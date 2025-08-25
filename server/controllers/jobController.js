const {
  prisma,
  JobStatus,
  ApplicationStatus,
  DepositStatus,
  supabase,
} = require("../db");

async function createJob(req, res) {
  try {
    const { title, initialDescription, fullDescription, address, hirerId } =
      req.body;

    // Validate required fields
    if (
      !title ||
      !initialDescription ||
      !fullDescription ||
      !address ||
      !hirerId
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const job = await prisma.job.create({
      data: {
        title,
        address,
        initialDescription,
        fullDescription,
        hirerId, // Directly use the provided Supabase UID
        status: JobStatus.PENDING,
      },
    });

    res.json(job);
  } catch (error) {
    console.error("Job Creation Error:", error.message);
    res.status(500).json({
      error: "job_creation_failed",
      message: error.message,
    });
  }
}

async function getJobs(req, res) {
  try {
    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        initialDescription: true,
        fullDescription: true,
        address: true,
        status: true,
        createdAt: true,
      },
      where: {
        status: {
          in: [JobStatus.PENDING] // Only show jobs that are accepting applications
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    console.error("Job List Error:", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: "job_list_retrieval_failed",
      message: "Failed to retrieve job listings",
      details: error.message,
      requestId: req.headers["x-request-id"],
    });
  }
}

async function getJob(req, res) {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({ where: { id } });
    res.json(job);
  } catch (error) {
    console.error("Job Get Error:", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      jobId: req.params.id,
    });
    res.status(500).json({
      error: "job_retrieval_failed",
      message: "Failed to retrieve job details",
      details: error.message,
      requestId: req.headers["x-request-id"],
    });
  }
}

async function updateJob(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const job = await prisma.job.update({
      where: { id },
      data: {
        status,
      },
    });
    res.json(job);
  } catch (error) {
    console.error("Job Update Error:", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      jobId: req.params.id,
      updateData: req.body,
    });
    res.status(500).json({
      error: "job_update_failed",
      message: "Failed to update job status",
      details: error.message,
      requestId: req.headers["x-request-id"],
    });
  }
}

async function deleteJob(req, res) {
  try {
    const { id } = req.params;
    await prisma.job.delete({ where: { id } });
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting job" });
  }
}

async function acceptJob(req, res) {
  try {
    const { jobId } = req.params;
    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMMITTED, // Changed from IN_PROGRESS
      },
    });
    res.json(job);
  } catch (error) {
    console.error("Job Accept Error:", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      jobId: req.params.jobId,
      updateData: { status: "IN_PROGRESS" },
    });
    res.status(500).json({
      error: "job_accept_failed",
      message: "Failed to accept job",
      details: error.message,
      requestId: req.headers["x-request-id"],
    });
  }
}

async function addJobImage(req, res) {
  try {
    const { id } = req.params;
    const { url, isPublic, caption } = req.body;

    // Verify the job exists and the user is the hirer
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // In your current auth setup, req.user isn't populated
    // We need to get the user from the session
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (job.hirerId !== user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to add images to this job" });
    }

    const jobImage = await prisma.jobImage.create({
      data: {
        url: url.trim(),
        isPublic,
        caption,
        jobId: id,
      },
    });

    res.status(201).json(jobImage);
  } catch (error) {
    console.error("Add Job Image Error:", error.message);
    res.status(500).json({
      error: "job_image_creation_failed",
      message: "Failed to add job image",
      details: error.message,
    });
  }
}

async function getJobImages(req, res) {
  try {
    const { id } = req.params;

    // Get the job to check if it exists
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Check authentication
    const authHeader = req.headers.authorization;
    let canViewAllImages = false;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (!error && user) {
        // Check if user is hirer
        if (job.hirerId === user.id) {
          canViewAllImages = true;
        } else {
          // Check if user is a worker with an accepted application
          const application = await prisma.jobApplication.findFirst({
            where: {
              jobId: id,
              workerId: user.id,
              status: "ACCEPTED",
            },
          });
          canViewAllImages = !!application;
        }
      }
    }

    // Get images based on access level
    const images = canViewAllImages
      ? await prisma.jobImage.findMany({ where: { jobId: id } })
      : await prisma.jobImage.findMany({
          where: {
            jobId: id,
            isPublic: true,
          },
        });

    res.json(images);
  } catch (error) {
    console.error("Get Job Images Error:", error.message);
    res.status(500).json({
      error: "job_images_retrieval_failed",
      message: "Failed to retrieve job images",
      details: error.message,
    });
  }
}

async function deleteJobImage(req, res) {
  try {
    const { imageId } = req.params;

    // Get the image to check ownership
    const jobImage = await prisma.jobImage.findUnique({
      where: { id: imageId },
      include: { job: true },
    });

    if (!jobImage) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (jobImage.job.hirerId !== user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this image" });
    }

    await prisma.jobImage.delete({
      where: { id: imageId },
    });

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete Job Image Error:", error.message);
    res.status(500).json({
      error: "job_image_deletion_failed",
      message: "Failed to delete job image",
      details: error.message,
    });
  }
}

async function startJob(req, res) {
  try {
    const { jobId } = req.params;
    
    // Get the job and verify it's in COMMITTED status
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          where: { status: ApplicationStatus.ACCEPTED },
          take: 1
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status !== JobStatus.COMMITTED) {
      return res.status(400).json({
        error: "invalid_status",
        message: "Job must be in COMMITTED status to start work"
      });
    }

    if (job.applications.length === 0) {
      return res.status(400).json({
        error: "no_accepted_application",
        message: "No accepted application found for this job"
      });
    }

    // Verify that the requesting user is the accepted worker
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (job.applications[0].workerId !== user.id) {
      return res.status(403).json({
        error: "not_authorized_worker",
        message: "Only the accepted worker can start this job"
      });
    }

    // Update job status to IN_PROGRESS
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.IN_PROGRESS }
    });

    res.json(updatedJob);
  } catch (error) {
    console.error("Start Job Error:", error.message);
    res.status(500).json({
      error: "job_start_failed",
      message: "Failed to start job",
      details: error.message,
    });
  }
}

async function completeJob(req, res) {
  try {
    const { jobId } = req.params;
    
    // Get the job and verify it's in IN_PROGRESS status
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          where: { status: ApplicationStatus.ACCEPTED },
          take: 1
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status !== JobStatus.IN_PROGRESS) {
      return res.status(400).json({
        error: "invalid_status",
        message: "Job must be in IN_PROGRESS status to be completed"
      });
    }

    if (job.applications.length === 0) {
      return res.status(400).json({
        error: "no_accepted_application",
        message: "No accepted application found for this job"
      });
    }

    // Verify that the requesting user is the accepted worker
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (job.applications[0].workerId !== user.id) {
      return res.status(403).json({
        error: "not_authorized_worker",
        message: "Only the accepted worker can complete this job"
      });
    }

    // Update job status to COMPLETED
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.COMPLETED }
    });

    res.json(updatedJob);
  } catch (error) {
    console.error("Complete Job Error:", error.message);
    res.status(500).json({
      error: "job_completion_failed",
      message: "Failed to complete job",
      details: error.message,
    });
  }
}

async function getJobsByHirer(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const jobs = await prisma.job.findMany({
      where: { hirerId: user.id },
      include: {
        applications: {
          include: {
            job: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(jobs);
  } catch (error) {
    console.error("Get Jobs By Hirer Error:", error.message);
    res.status(500).json({
      error: "hirer_jobs_retrieval_failed",
      message: "Failed to retrieve hirer jobs",
      details: error.message,
    });
  }
}

module.exports = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  acceptJob,
  addJobImage,
  getJobImages,
  deleteJobImage,
  startJob,
  completeJob,
  getJobsByHirer,
};
