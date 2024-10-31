import axios from "../../../shared/apiClient";

export const deleteAssignment = async (assignmentId) => {
  try {
    const response = await axios.delete(`assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting assignment:", error);
    throw error;
  }
};
