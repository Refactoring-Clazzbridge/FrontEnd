import axios from "../../../shared/apiClient";

export const updateComment = async (updateDTO) => {
  console.log(updateDTO, "수정 데이터 ");

  try {
    const response = await axios.put(`comments`, updateDTO);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};
