const { prisma } = require("../db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function handleWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      await prisma.payment.update({
        where: { stripePaymentId: paymentIntent.id },
        data: { status: "PAID" },
      });
      break;
    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      await prisma.payment.update({
        where: { stripePaymentId: failedPayment.id },
        data: { status: "FAILED" },
      });
      break;
    case "refund.created":
      const refund = event.data.object;
      await prisma.payment.update({
        where: { stripePaymentId: refund.payment_intent },
        data: { status: "REFUNDED" },
      });
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

module.exports = { handleWebhook };
