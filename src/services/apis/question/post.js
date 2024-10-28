import apiClient from "../../../shared/apiClient";

export const saveQuestionApi = async (data) => {
  const { content, memberId, courseId } = data;
  console.log(data, "입력 데이터 ");
  const savedQuestion = {
    content,
    memberId,
    courseId,
  };

  try {
    const response = await apiClient.post(`qnas/questions/`, savedQuestion);
    return response.data;
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
};
