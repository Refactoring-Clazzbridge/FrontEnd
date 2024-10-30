import axios from "../../../shared/apiClient";

export const getCourseId = async () => {
  try {
    const response = await axios.get("studentCourses");
    return response.data;
  } catch (error) {
    console.error("Error fetching studentCourses:", error);
    throw error;
  }
};

export const getStudentCourseId = async () => {
  try {
    const response = await axios.get("studentCourses/studentCourseId");
    return response.data;
  } catch (error) {
    console.error("Error fetching studentCourses:", error);
    throw error;
  }
};

export const getTeacherByCourseId = async () => {
  try {
    const response = await axios.get("course/teacher");
    return response.data;
  } catch (error) {
    console.error("Error fetching studentCourses:", error);
    throw error;
  }
};
