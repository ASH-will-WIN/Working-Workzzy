const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

// Validate environment variables
const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_KEY", "STRIPE_SECRET_KEY"];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

const { PrismaClient } = require("@prisma/client");

// Initialize singleton Prisma Client with explicit config
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

let prisma;
try {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ["query", "info", "warn", "error"],
    errorFormat: "minimal",
  });
} catch (err) {
  console.error("Prisma initialization error:", err);
  process.exit(1);
}

// Initialize Supabase client with validation
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl.startsWith("https://") || !supabaseKey.startsWith("ey")) {
  throw new Error("Invalid Supabase credentials format");
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Stripe client with validation and sanitization
const stripe = require("stripe");

// Remove any spaces or newlines that might have been accidentally copied/pasted in Railway
// This fixes the "An error occurred with our connection to Stripe" error
const rawSecretKey = process.env.STRIPE_SECRET_KEY || "";
const sanitizedSecretKey = rawSecretKey.replace(/\s/g, "");

const stripeClient = stripe(sanitizedSecretKey);

const {
  JobStatus,
  PaymentStatus,
  ApplicationStatus,
  DepositStatus,
} = require("@prisma/client");

module.exports = {
  prisma,
  supabase,
  stripeClient,
  JobStatus,
  PaymentStatus,
  ApplicationStatus, // Add this
  DepositStatus, // Add this
};
