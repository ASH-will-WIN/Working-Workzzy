import { apiClient } from "./apiClient";

export const createFinalPayment = async (paymentData) => {
  const response = await apiClient.post("/payments/final", paymentData);
  return response.data;
};

export const confirmFinalPayment = async (paymentId) => {
  const response = await apiClient.patch(`/payments/${paymentId}/confirm`);
  return response.data;
};

export const getPaymentsForJob = async (jobId) => {
  const response = await apiClient.get(`/payments?jobId=${jobId}`);
  return response.data;
};
