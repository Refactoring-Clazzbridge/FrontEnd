import apiClient from "../../../shared/apiClient";

export const updateQuestionApi = async (data) => {
  const { content, id } = data;
  console.log(data, "입력 데이터 ");
  const updatedQuestion = {
    content,
    id,
  };

  try {
    const response = await apiClient.put(`qnas/questions`, updatedQuestion);
    return response.data;
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
};

// recommended 상태 변경을 위한 새로운 API 함수 추가
// services/apis/question/put.js

// 기존 updateQuestionApi는 유지하고 아래 함수 추가
export const toggleQuestionRecommendApi = async (
  questionId,
  currentRecommended,
) => {
  try {
    console.log(
      "Sending request with questionId and isRecommended:",
      questionId,
      !currentRecommended, // 현재 상태의 반대값 전송
    );
    const response = await apiClient.put(`qnas/questions/recommended`, {
      id: questionId,
      isRecommended: !currentRecommended, // 현재 상태의 반대값 전송
    });
    console.log("Toggle recommend response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error toggling question recommendation:", {
      error,
      requestData: { id: questionId, isRecommended: !currentRecommended },
      response: error.response?.data,
    });
    throw error;
  }
};
