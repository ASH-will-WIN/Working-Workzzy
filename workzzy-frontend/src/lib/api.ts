const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiOptions {
  method?: string;
  body?: any;
}

export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = "GET", body } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const storedSession = localStorage.getItem("supabase.auth.token");
  if (storedSession) {
    try {
      const session = JSON.parse(storedSession);
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      console.error("Error parsing session:", e);
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
  createJob: (jobData: any) =>
    apiRequest("/jobs", { method: "POST", body: jobData }),
  acceptJob: (jobId: string) =>
    apiRequest(`/jobs/accept/${jobId}`, { method: "PATCH" }),
};

export const paymentApi = {
  getPayments: () => apiRequest("/payments"),
  getPayment: (id: string) => apiRequest(`/payments/${id}`),
  createPayment: (paymentData: any) =>
    apiRequest("/payments", { method: "POST", body: paymentData }),
};
