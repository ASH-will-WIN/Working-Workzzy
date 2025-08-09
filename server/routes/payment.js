const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Create a new payment
router.post("/", paymentController.createPayment);

// Get a list of payments
router.get("/", paymentController.getPayments);

router.get("/:id", paymentController.getPayment);
router.patch("/:id", paymentController.updatePayment);
router.delete("/:id", paymentController.deletePayment);
module.exports = router;
