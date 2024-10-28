import axios from "../../../shared/apiClient";

export const createAssignment = async (assignmentRequestDTO) => {
  try {
    const response = await axios.post(`assignments`, assignmentRequestDTO);
    return response.data; // 서버의 응답 데이터 반환
  } catch (error) {
    console.error("Error fetching assignments:", error); // 오류 로그
    throw error; // 오류 발생 시 다시 던짐
  }
};
