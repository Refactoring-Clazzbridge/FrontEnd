import axios from "../../../shared/apiClient";

export const saveComment = async (data) => {
  try {
    const response = await axios.post(`comments`, data);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};
