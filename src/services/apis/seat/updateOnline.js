import apiClient from "../../../shared/apiClient";

export const updateStudentOnlineStatus = async (seatId, isOnline) => {
  try {
    const response = await apiClient.put(`seat/status/${seatId}`, { isOnline });
    return response.data;
  } catch (error) {
    console.error("Error updating online status:", error);
    throw error;
  }
};
