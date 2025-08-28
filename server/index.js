require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

const jobRoutes = require("./routes/job");
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const applicationRoutes = require("./routes/application");
const connectRoutes = require("./routes/connect");
const webhookRoutes = require("./routes/webhook");
const messageRoutes = require("./routes/message");

// Webhook routes (must be before express.json middleware)
app.use("/api/webhooks", webhookRoutes);

app.use(cors());
// Increase payload size limit for Base64-encoded images
// Base64 encoding increases size by ~33%, so 10MB images become ~13MB
// Allow up to 50MB to handle multiple large images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/connect", connectRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Workzzy API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
