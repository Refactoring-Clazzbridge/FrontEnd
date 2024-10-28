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

<<<<<<< HEAD
export const getStudentCourseId = async () => {
  try {
    const response = await axios.get("studentCourses/studentCourseId");
=======
export const getTeacherByCourseId = async () => {
  try {
    const response = await axios.get("course/teacher");
>>>>>>> origin/dev
    return response.data;
  } catch (error) {
    console.error("Error fetching studentCourses:", error);
    throw error;
  }
};
