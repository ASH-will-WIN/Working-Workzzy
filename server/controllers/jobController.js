const { prisma, JobStatus } = require("../db"); // Add JobStatus import

async function createJob(req, res) {
  try {
    const { title, initialDescription, fullDescription, address, hirerId } =
      req.body;

    // Validate required fields
    if (
      !title ||
      !initialDescription ||
      !fullDescription ||
      !address ||
      !hirerId
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const job = await prisma.job.create({
      data: {
        title,
        address,
        initialDescription,
        fullDescription,
        hirerId, // Directly use the provided Supabase UID
        status: JobStatus.PENDING,
      },
    });

    res.json(job);
  } catch (error) {
    console.error("Job Creation Error:", error.message);
    res.status(500).json({
      error: "job_creation_failed",
      message: error.message,
    });
  }
}

async function getJobs(req, res) {
  try {
    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        initialDescription: true,
        fullDescription: true,
        status: true,
      },
    });
    res.json(jobs);
  } catch (error) {
    console.error("Job List Error:", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: "job_list_retrieval_failed",
      message: "Failed to retrieve job listings",
      details: error.message,
      requestId: req.headers["x-request-id"],
    });
  }
}

async function getJob(req, res) {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({ where: { id } });
    res.json(job);
  } catch (error) {
    console.error("Job Get Error:", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      jobId: req.params.id,
    });
    res.status(500).json({
      error: "job_retrieval_failed",
      message: "Failed to retrieve job details",
      details: error.message,
      requestId: req.headers["x-request-id"],
    });
  }
}

async function updateJob(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const job = await prisma.job.update({
      where: { id },
      data: {
        status,
      },
    });
    res.json(job);
  } catch (error) {
    console.error("Job Update Error:", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      jobId: req.params.id,
      updateData: req.body,
    });
    res.status(500).json({
      error: "job_update_failed",
      message: "Failed to update job status",
      details: error.message,
      requestId: req.headers["x-request-id"],
    });
  }
}

async function deleteJob(req, res) {
  try {
    const { id } = req.params;
    await prisma.job.delete({ where: { id } });
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting job" });
  }
}

async function acceptJob(req, res) {
  try {
    const { jobId } = req.params;
    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.IN_PROGRESS,
      },
    });
    res.json(job);
  } catch (error) {
    console.error("Job Accept Error:", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      jobId: req.params.jobId,
      updateData: { status: "IN_PROGRESS" },
    });
    res.status(500).json({
      error: "job_accept_failed",
      message: "Failed to accept job",
      details: error.message,
      requestId: req.headers["x-request-id"],
    });
  }
}

module.exports = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  acceptJob,
};
