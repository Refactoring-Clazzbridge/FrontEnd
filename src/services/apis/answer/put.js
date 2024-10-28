import apiClient from "../../../shared/apiClient";

export const updateAnswerApi = async (data) => {
  const { id, content } = data;
  console.log(data, "입력 데이터 ");
  const updatedAnswer = {
    id,
    content, // 변경된 필드
  };

  try {
    const response = await apiClient.put(`qnas/answers`, updatedAnswer);
    console.log("수정 완료");
    return response.data;
  } catch (error) {
    console.error("Error updating answer:", error);
    throw error;
  }
};
