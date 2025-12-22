const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth/authController");

// Routes
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
