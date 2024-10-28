import axios from "../../../shared/apiClient";

export const submitAssignment = async (formData) => {
  try {
    // 'submissions' 엔드포인트로 POST 요청
    const response = await axios.post(`submissions`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // multipart/form-data 헤더 설정
      },
    });
    return response.data; // 서버의 응답 데이터 반환
  } catch (error) {
    console.error("Error fetching submissions:", error); // 오류 로그
    throw error; // 오류 발생 시 다시 던짐
  }
};
