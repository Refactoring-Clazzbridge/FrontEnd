import apiClient from "../../../shared/apiClient";

export const getQuestionApi = async (questionId) => {
  try {
    const response = await apiClient.get(`qnas/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
};

export const getAllQuestions = async () => {
  try {
    const response = await apiClient.get("qnas/questions");
    console.log("질문 리스트 출력!!");
    return response.data;
  } catch (error) {
    console.error("Error fetching all questions:", error);
    throw error;
  }
};
