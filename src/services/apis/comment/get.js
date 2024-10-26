import axios from "../../../shared/apiClient";

export const getCommentByPost = async (postId) => {
  try {
    const response = await axios.get(`comments/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comment:", error);
    throw error;
  }
};
