import axios from "../../../shared/apiClient";

export const getAllCourse = async () => {
  try {
    const response = await axios.get(`course`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

export const getStudentsByCourseId = async (assignmentId) => {
  try {
    console.log(assignmentId, "assignmentId");
    const response = await axios.get(`course/students/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

export const getCourseIdForUser = async () => {
  try {
    const response = await axios.get(`course/userCourseId`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};
