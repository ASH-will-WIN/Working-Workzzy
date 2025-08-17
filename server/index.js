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

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/", (req, res) => {
  res.send("Workzzy API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
