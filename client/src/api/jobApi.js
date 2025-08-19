import { apiClient } from "./apiClient";

export const getJobs = async () => {
  const response = await apiClient.get("/jobs");
  return response.data;
};

export const getJobById = async (id) => {
  const response = await apiClient.get(`/jobs/${id}`);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await apiClient.post("/jobs", jobData);
  return response.data;
};
