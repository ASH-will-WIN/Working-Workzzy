const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, jobController.createJob); // ADD MIDDLEWARE
router.get("/", authMiddleware, jobController.getJobs); // ADD MIDDLEWARE
router.get("/:id", authMiddleware, jobController.getJob); // ADD MIDDLEWARE
router.patch("/:id", authMiddleware, jobController.updateJob); // ADD THIS LINE
router.patch("/accept/:jobId", authMiddleware, jobController.acceptJob); // ADD MIDDLEWARE

router.post("/:id/images", authMiddleware, jobController.addJobImage); // ADD MIDDLEWARE
router.get("/:id/images", authMiddleware, jobController.getJobImages); // ADD MIDDLEWARE
router.delete("/images/:imageId", authMiddleware, jobController.deleteJobImage); // ADD MIDDLEWARE

module.exports = router;
