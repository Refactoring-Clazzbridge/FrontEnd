import apiClient from "../../../shared/apiClient";

export const saveAnswerApi = async (data) => {
  const { questionId, teacherId, content } = data;
  console.log(data, "입력 데이터 ");
  const savedAnswer = {
    questionId,
    teacherId,
    content, // 변경된 필드
  };

  try {
    const response = await apiClient.post(`qnas/answers`, savedAnswer);
    console.log("등록 완료");
    return response.data;
  } catch (error) {
    console.error("Error saving answer:", error);
    throw error;
  }
};
