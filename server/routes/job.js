const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

router.post("/", jobController.createJob);
router.get("/", jobController.getJobs);
router.patch("/accept/:jobId", jobController.acceptJob);

module.exports = router;
