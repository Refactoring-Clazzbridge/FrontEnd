import axios from "../../../shared/apiClient";

export const savePost = async (data) => {
  const { title, content, boardId: boardTypeId, courseId } = data;
  const savedPost = {
    title,
    content,
    boardTypeId,
    courseId,
  };

  console.log("savedPost = ", savedPost);

  try {
    const response = await axios.post(`posts`, savedPost);
    return response.data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};
