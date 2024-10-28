import apiClient from "../../../shared/apiClient";

export const deleteAnswerApi = async (answerId) => {
  try {
    const response = await apiClient.delete(`qnas/answers/${answerId}`);
    console.log("삭제 완료");
    return response.data;
  } catch (error) {
    console.error("Error fetching answer:", error);
    throw error;
  }
};
