import { apiClient } from "./apiClient";

// Add this function to search users
export const searchUsers = async (query) => {
  const response = await apiClient.get("/api/users/search", {
    params: { q: query },
  });
  return response.data;
};
