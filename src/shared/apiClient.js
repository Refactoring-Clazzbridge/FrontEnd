import axios from "axios";

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL, // 기본 URL 추가
});

// 요청 인터셉터 설정: 모든 요청에 Authorization 헤더를 자동으로 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 로컬 스토리지에서 토큰 가져오기
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // 토큰을 Authorization 헤더에 추가
    }
    return config; // 요청 계속 진행
  },
  (error) => {
    return Promise.reject(error); // 요청 에러 처리
  },
);

// 생성한 인스턴스 사용
export default apiClient;
