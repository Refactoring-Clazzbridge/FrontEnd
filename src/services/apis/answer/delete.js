import apiClient from "../../../shared/apiClient";

export const deleteAnswerApi = async (id) => {
  try {
    const response = await apiClient.delete(`qnas/answers`, { data: id });
    console.log("삭제 완료")
    return response.data;
  } catch (error) {
    console.error("Error fetching answer:", error);
    throw error;
  }
};
