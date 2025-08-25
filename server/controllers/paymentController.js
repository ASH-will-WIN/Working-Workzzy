const { prisma, stripeClient } = require("../db");

async function createPayment(req, res) {
  let paymentIntent;
  try {
    const { job_id, amount, hirer_id, worker_id } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "invalid_amount",
        message: "Amount must be a positive number",
      });
    }

    // Calculate platform fee (10%) and worker amount (90%)
    const platformFee = Math.round(amount * 0.1 * 100) / 100; // Round to 2 decimal places
    const workerAmount = Math.round(amount * 0.9 * 100) / 100; // Round to 2 decimal places

    paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { job_id, hirer_id, worker_id },
    });

    const payment = await prisma.payment.create({
      data: {
        jobId: job_id,
        amount,
        platformFee, // Add this field
        workerAmount, // Add this field
        hirerId: hirer_id,
        workerId: worker_id,
        stripePaymentId: paymentIntent.id,
        status: "PENDING",
      },
    });

    res.json({ payment, paymentIntent });
  } catch (error) {
    console.error("Payment Error:", error.message);
    if (paymentIntent?.id) {
      await stripeClient.paymentIntents.cancel(paymentIntent.id);
    }
    res.status(500).json({
      error: "payment_failed",
      message: error.message,
    });
  }
}

async function getPayments(req, res) {
  try {
    const { jobId } = req.query;

    let whereClause = {};
    if (jobId) {
      whereClause.jobId = jobId;
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    // Add data validation to handle potential null values
    const safePayments = payments.map((payment) => ({
      ...payment,
      platformFee: payment.platformFee !== null ? payment.platformFee : 0,
      workerAmount: payment.workerAmount !== null ? payment.workerAmount : 0,
      depositRefund: payment.depositRefund !== null ? payment.depositRefund : 0, // ADD THIS
    }));

    res.json(safePayments);
  } catch (error) {
    console.error("Get Payments Error:", error.message);
    res.status(500).json({
      message: "Error getting payments",
      details: error.message,
    });
  }
}

async function getPayment(req, res) {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({ where: { id } });
    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting payment" });
  }
}

async function updatePayment(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status,
      },
    });
    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating payment" });
  }
}

async function deletePayment(req, res) {
  try {
    const { id } = req.params;
    await prisma.payment.delete({ where: { id } });
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting payment" });
  }
}

async function createFinalPayment(req, res) {
  try {
    const { jobId, amount } = req.body;

    // Get the job and verify it's completed
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          where: { status: "ACCEPTED" },
          take: 1,
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status !== "COMPLETED") {
      return res.status(400).json({
        error: "job_not_completed",
        message: "Job must be completed before final payment",
      });
    }

    if (job.applications.length === 0) {
      return res.status(400).json({
        error: "no_accepted_application",
        message: "No accepted application found for this job",
      });
    }

    const workerId = job.applications[0].workerId;
    const hirerId = job.hirerId;

    // Calculate platform fee (10%) and worker amount (90%)
    const platformFee = Math.round(amount * 0.1 * 100) / 100;
    const workerAmount = Math.round(amount * 0.9 * 100) / 100;

    // Worker also gets their $5 deposit refunded
    const depositRefund = 5.0;
    const totalWorkerAmount = workerAmount + depositRefund;

    // Verify worker has a connected account with payouts enabled
    const stripeAccount = await prisma.stripeAccount.findUnique({
      where: { userId: workerId },
    });
    if (!stripeAccount) {
      return res.status(400).json({
        error: "worker_not_onboarded",
        message: "Worker has not completed payout onboarding",
      });
    }

    // Fetch latest account status
    const acct = await stripeClient.accounts.retrieve(stripeAccount.accountId);
    if (!acct.charges_enabled) {
      return res.status(400).json({
        error: "worker_not_ready",
        message: "Worker's Stripe account is not ready to receive funds",
      });
    }

    // Create PaymentIntent with application fee and transfer to worker (destination charge)
    const amountInCents = Math.round(amount * 100);
    const applicationFeeAmount = Math.round(platformFee * 100);

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      payment_method_types: ["card"],
      transfer_data: {
        destination: stripeAccount.accountId, // funds (less application fee) go to worker account
      },
      application_fee_amount: applicationFeeAmount, // 10% to platform
      metadata: { jobId, hirerId, workerId, type: "FINAL_PAYMENT" },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        jobId,
        amount,
        platformFee,
        workerAmount: totalWorkerAmount, // 90% + $5 deposit refund
        depositRefund, // Track the $5 deposit refund separately
        hirerId,
        workerId,
        stripePaymentId: paymentIntent.id,
        status: "PENDING",
      },
    });

    res.json({
      payment,
      paymentIntent,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Final Payment Error:", error.message);
    res.status(500).json({
      error: "final_payment_failed",
      message: error.message,
    });
  }
}

async function confirmFinalPayment(req, res) {
  try {
    const { paymentId } = req.params;

    // Get the payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({
        error: "invalid_payment_status",
        message: "Payment is not in pending status",
      });
    }

    // Fetch the payment record details
    const jobPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    // Mark payment as paid
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "PAID" },
    });

    // Attempt to send $5 deposit refund to the worker as an additional transfer
    try {
      const stripeAccount = await prisma.stripeAccount.findUnique({
        where: { userId: jobPayment.workerId },
      });
      if (stripeAccount) {
        // Create a separate transfer of $5 from platform to worker account
        await stripeClient.transfers.create({
          amount: 500, // $5 in cents
          currency: "usd",
          destination: stripeAccount.accountId,
          description: `Deposit refund for job ${jobPayment.jobId}`,
        });
      }
    } catch (transferError) {
      console.error("Deposit transfer error:", transferError.message);
      // Do not fail the request if the transfer fails; log for manual follow-up
    }

    res.json(updatedPayment);
  } catch (error) {
    console.error("Confirm Final Payment Error:", error.message);
    res.status(500).json({
      error: "payment_confirmation_failed",
      message: error.message,
    });
  }
}

module.exports = {
  createPayment,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
  createFinalPayment,
  confirmFinalPayment,
};
