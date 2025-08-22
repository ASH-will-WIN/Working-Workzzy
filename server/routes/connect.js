const express = require("express");
const router = express.Router();
const { stripeClient } = require("../db");
const { prisma } = require("../db");
const authMiddleware = require("../middleware/auth");

// Create Stripe Connect account
router.post("/account", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if account already exists
    let stripeAccount = await prisma.stripeAccount.findUnique({
      where: { userId: user.id }
    });

    if (!stripeAccount) {
      // Create new Stripe account
      const account = await stripeClient.accounts.create({
        type: "express",
        country: "US",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      // Create account in database
      stripeAccount = await prisma.stripeAccount.create({
        data: {
          userId: user.id,
          accountId: account.id,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
        },
      });
    }

    // Create account link
    const accountLink = await stripeClient.accountLinks.create({
      account: stripeAccount.accountId,
      refresh_url: `${process.env.FRONTEND_URL}/connect-refresh`,
      return_url: `${process.env.FRONTEND_URL}/connect-return`,
      type: "account_onboarding",
    });

    res.json({ 
      url: accountLink.url,
      accountId: stripeAccount.accountId 
    });
  } catch (error) {
    console.error("Stripe Connect error:", error);
    res.status(500).json({ error: "Stripe Connect failed" });
  }
});

// Get onboarding status
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const stripeAccount = await prisma.stripeAccount.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!stripeAccount) {
      return res.status(404).json({ error: "No Stripe account found" });
    }
    
    res.json(stripeAccount);
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: "Status check failed" });
  }
});

module.exports = router;
