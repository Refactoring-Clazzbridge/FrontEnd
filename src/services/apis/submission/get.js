import axios from "../../../shared/apiClient";

export const checkSubmission = async (studentCourseId, assignmentId) => {
  try {
    const response = await axios.get(`submissions/check`, {
      params: {
        studentCourseId: studentCourseId,
        assignmentId: assignmentId,
      },
    });
    console.log("제출 여부:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching checkSubmission:", error);
    throw error;
  }
};
