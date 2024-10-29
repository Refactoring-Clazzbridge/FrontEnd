import apiClient from "../../../shared/apiClient";

export const getStudentOnlineStatus = async (memberId) => {
    try {
      const response = await apiClient.get(`seat/status/${memberId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching online status:", error);
      throw error;
    }
  };