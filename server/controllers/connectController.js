const { prisma, stripeClient } = require("../db");

// Create or fetch a Stripe Connect account for the current user, and return an onboarding link
async function createOrGetOnboardingLink(req, res) {
  try {
    const userId = req.user.id;

    // Find existing Stripe account record
    let accountRecord = await prisma.stripeAccount.findUnique({
      where: { userId },
    });

    // If no record, create a new Express account in Stripe and store it
    if (!accountRecord) {
      const account = await stripeClient.accounts.create({
        type: "express",
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
      });

      accountRecord = await prisma.stripeAccount.create({
        data: {
          userId,
          accountId: account.id,
          chargesEnabled: Boolean(account.charges_enabled),
          payoutsEnabled: Boolean(account.payouts_enabled),
          detailsSubmitted: Boolean(account.details_submitted),
        },
      });
    }

    // Always generate a fresh onboarding link
    const accountLink = await stripeClient.accountLinks.create({
      account: accountRecord.accountId,
      refresh_url:
        process.env.CONNECT_REFRESH_URL || "http://localhost:3000/dashboard",
      return_url:
        process.env.CONNECT_RETURN_URL || "http://localhost:3000/dashboard",
      type: "account_onboarding",
    });

    res.json({
      accountId: accountRecord.accountId,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error("Create onboarding link error:", error.message);
    res.status(500).json({
      error: "connect_onboarding_failed",
      message: error.message,
    });
  }
}

// Get current user's connect account status
async function getMyConnectStatus(req, res) {
  try {
    const userId = req.user.id;
    const record = await prisma.stripeAccount.findUnique({ where: { userId } });

    if (!record) {
      return res.json({
        exists: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      });
    }

    // Fetch fresh status from Stripe and update DB
    const acct = await stripeClient.accounts.retrieve(record.accountId);

    const updated = await prisma.stripeAccount.update({
      where: { userId },
      data: {
        chargesEnabled: Boolean(acct.charges_enabled),
        payoutsEnabled: Boolean(acct.payouts_enabled),
        detailsSubmitted: Boolean(acct.details_submitted),
      },
    });

    res.json({
      exists: true,
      accountId: updated.accountId,
      chargesEnabled: updated.chargesEnabled,
      payoutsEnabled: updated.payoutsEnabled,
      detailsSubmitted: updated.detailsSubmitted,
    });
  } catch (error) {
    console.error("Get connect status error:", error.message);
    res.status(500).json({
      error: "connect_status_failed",
      message: error.message,
    });
  }
}

module.exports = {
  createOrGetOnboardingLink,
  getMyConnectStatus,
};
