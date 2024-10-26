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
