const { prisma, stripeClient } = require("../db");

async function createPayment(req, res) {
  let paymentIntent;

  try {
    const { job_id, amount, hirer_id, worker_id } = req.body;

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
        hirerId: hirer_id,
        workerId: worker_id,
        stripePaymentId: paymentIntent.id, // Updated field name
        status: "PENDING",
      },
    });

    res.json({ payment, paymentIntent });
  } catch (error) {
    console.error("Payment Error:", error.message);
    if (paymentIntent?.id) {
      await stripeClient.paymentIntents.cancel(paymentIntent.id);
    }
    res.status(500).json({ error: "payment_failed", message: error.message });
  }
}

async function getPayments(req, res) {
  try {
    const payments = await prisma.payment.findMany();
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting payments" });
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

module.exports = {
  createPayment,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
};
