import { apiClient } from "./apiClient";

// Existing job functions
export const createJob = async (jobData) => {
  const response = await apiClient.post("/jobs", jobData);
  return response.data;
};

export const getJobs = async () => {
  const response = await apiClient.get("/jobs");
  return response.data;
};

export const getJobById = async (id) => {
  const response = await apiClient.get(`/jobs/${id}`);
  return response.data;
};

// New job workflow functions
export const startJob = async (jobId) => {
  const response = await apiClient.patch(`/jobs/${jobId}/start`);
  return response.data;
};

export const completeJob = async (jobId) => {
  const response = await apiClient.patch(`/jobs/${jobId}/complete`);
  return response.data;
};

export const getJobsByHirer = async () => {
  const response = await apiClient.get("/jobs/hirer/my-jobs");
  return response.data;
};
