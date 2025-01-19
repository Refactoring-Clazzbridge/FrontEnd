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

// 특정 강의에 대한 모든 질문을 가져오는 함수
export const getQuestionsByCourseId = async (courseId) => {
  try {
    console.log("API 호출 - courseId:", courseId);
    const response = await apiClient.get(`qnas/questions/course/${courseId}`);
    console.log("API 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching questions by course ID:", error);
    throw error;
  }
};

export const getAllQuestions = async () => {
  try {
    const response = await apiClient.get("qnas/questions");
    return response.data;
  } catch (error) {
    console.error("Error fetching all questions:", error);
    throw error;
  }
};
