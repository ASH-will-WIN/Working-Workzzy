const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Only import types that are actually used
import type { JobApplication, Job } from "./types";
import { supabase } from "./supabaseClient";

interface ApiOptions {
  method?: string;
  body?: any;
}

export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = "GET", body } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Use Supabase's built-in session management
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log("API Request - Current session:", session);
  if (session) {
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = {};
    }
    throw new Error(
      errorData.message || `API request failed: ${response.status}`
    );
  }

  return response.json();
}

// Specific API calls
export const jobApi = {
  getJobs: () => apiRequest("/jobs"),
  getJob: (id: string) => apiRequest(`/jobs/${id}`),
  createJob: (jobData: {
    title: string;
    initialDescription: string;
    fullDescription: string;
    address: string;
    hirerId: string;
  }) => apiRequest("/jobs", { method: "POST", body: jobData }),
  updateJob: (id: string, jobData: { status: string }) =>
    apiRequest(`/jobs/${id}`, { method: "PATCH", body: jobData }),
  getJobImages: (jobId: string) => apiRequest(`/jobs/${jobId}/images`),
  addJobImage: (
    jobId: string,
    imageData: { url: string; isPublic: boolean; caption?: string }
  ) => apiRequest(`/jobs/${jobId}/images`, { method: "POST", body: imageData }),
};

export const applicationApi = {
  createApplication: (data: { jobId: string; message: string }) =>
    apiRequest("/applications", { method: "POST", body: data }),
  getApplications: () => apiRequest("/applications"),
  getJobApplications: (jobId: string) =>
    apiRequest(`/applications/jobs/${jobId}`),
  acceptApplication: (id: string) =>
    apiRequest(`/applications/${id}/accept`, { method: "PATCH" }),
  rejectApplication: (id: string) =>
    apiRequest(`/applications/${id}/reject`, { method: "PATCH" }),
  confirmApplicationPayment: (id: string) =>
    apiRequest(`/applications/${id}/confirm`, { method: "POST" }),
};

export const paymentApi = {
  createPayment: (paymentData: {
    job_id: string;
    amount: number;
    hirer_id: string;
    worker_id: string;
  }) => apiRequest("/payments", { method: "POST", body: paymentData }),
  getPayments: () => apiRequest("/payments"),
};
