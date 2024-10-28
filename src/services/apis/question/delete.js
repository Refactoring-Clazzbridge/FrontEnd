import apiClient from "../../../shared/apiClient";

export const deleteQuestionsApi = async (ids) => {
  try {
    const response = await apiClient.delete(`qnas/questions`, { data: ids });
    return response.data;
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
};
