import apiClient from "../../../shared/apiClient";

// services/apis/course/get.js
export const getStudentCourseId = async () => {
  try {
    const response = await apiClient.get("course/student");
    console.log("학생 courseId 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching student course ID:", error);
    throw error;
  }
};
