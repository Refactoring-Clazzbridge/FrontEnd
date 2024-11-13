import axios from "../../../shared/apiClient";

export const getAssignmentsByCourseId = async (courseId) => {
  try {
    const response = await axios.get(`assignments/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};

export const getAllAssignments = async () => {
  try {
    const response = await axios.get(`assignments`);
    console.log(response.data, "assignments.data");
    return response.data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};
