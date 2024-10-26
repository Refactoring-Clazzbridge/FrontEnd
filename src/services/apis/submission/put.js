import axios from "../../../shared/apiClient";

export const updatePost = async (updateDTO) => {
  console.log(updateDTO, "입력 데이터 ");
  const { id, title, content } = updateDTO;
  const updatePost = {
    id,
    title,
    content,
  };

  try {
    const response = await axios.put(`posts`, updatePost);
    return response.data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};
