import { apiClient } from "./apiClient";

const getStripeAccount = async () => {
  const response = await apiClient.get("/api/connect/status");
  return response.data;
};

const createStripeAccountLink = async () => {
  const response = await apiClient.post("/api/connect/account", {});
  return response.data;
};

const refreshStripeStatus = async () => {
  const response = await apiClient.post("/api/connect/refresh", {});
  return response.data;
};

export const connectApi = {
  getStripeAccount,
  createStripeAccountLink,
  refreshStripeStatus,
};

