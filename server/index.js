require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const db = require("./db");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

const jobRoutes = require("./routes/job");
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const applicationRoutes = require("./routes/application");
const connectRoutes = require("./routes/connect");
const webhookRoutes = require("./routes/webhook");
const messageRoutes = require("./routes/message");
const reportRoutes = require("./routes/report");

// Webhook routes (must be before express.json middleware)
app.use("/api/webhooks", webhookRoutes);

const allowedOrigins = [
  "http://localhost:3000", // Local development
  "https://wurkzi.com",
  "https://www.wurkzi.com",
  "https://fantastic-motivation-production.up.railway.app",
];

if (process.env.CLIENT_URL) {
  const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
  allowedOrigins.push(clientUrl);

  // Also allow the alternative (www vs non-www)
  if (clientUrl.includes("://www.")) {
    allowedOrigins.push(clientUrl.replace("://www.", "://"));
  } else if (clientUrl.includes("://")) {
    allowedOrigins.push(clientUrl.replace("://", "://www."));
  }
}

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        console.error(`CORS Blocked: Origin "${origin}" not in allowed list:`, allowedOrigins);
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Increase payload size limit for Base64-encoded images
// Base64 encoding increases size by ~33%, so 10MB images become ~13MB
// Allow up to 50MB to handle multiple large images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/connect", connectRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.send("Workzzy API is running");
});

// Remove static file serving if we are just an API
// app.use(express.static(path.join(__dirname, "../client/build")));
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/build", "index.html"));
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

