import apiClient from "../../../shared/apiClient";

export const getAnswersByQuestionIdApi = async (questionId) => {
  try {
    const response = await apiClient.get(`qnas/answers/question/${questionId}`);
    console.log("답변 조회");
    return response.data;
  } catch (error) {
    console.error("Error fetching answers:", error);
    throw error;
  }
};
