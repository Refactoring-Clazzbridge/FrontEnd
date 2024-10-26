import axios from "../../../shared/apiClient";

export const deleteComment = async (id) => {
  try {
    const response = await axios.delete(`comments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};
