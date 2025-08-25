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

// Job image functions
export const addJobImage = async (jobId, imageData) => {
  const response = await apiClient.post(`/jobs/${jobId}/images`, imageData);
  return response.data;
};

export const getJobImages = async (jobId) => {
  const response = await apiClient.get(`/jobs/${jobId}/images`);
  return response.data;
};

export const deleteJobImage = async (imageId) => {
  const response = await apiClient.delete(`/jobs/images/${imageId}`);
  return response.data;
};

// Upload image to base64 for demo purposes
// In production, you'd upload to a service like AWS S3, Cloudinary, etc.
export const uploadImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      reject(new Error('File size must be less than 5MB'));
      return;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      reject(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
