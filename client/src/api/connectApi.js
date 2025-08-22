import { apiClient } from "./apiClient";

export const getMyConnectStatus = async () => {
  const { data } = await apiClient.get("/connect/me");
  return data;
};

export const createOnboardingLink = async () => {
  const { data } = await apiClient.post("/connect/onboarding");
  return data;
};
