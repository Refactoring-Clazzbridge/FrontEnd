import apiClient from "../../../shared/apiClient";

export const getTeacherCourseId = async () => {
  try {
    console.log("API 호출 시작");
    const response = await apiClient.get("course/teacher"); // courses -> course로 수정
    return response.data;
  } catch (error) {
    console.log("API 호출 실패");
    console.error("Error fetching teacher course ID:", error);
    throw error;
  }
};
