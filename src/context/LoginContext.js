import React, {createContext, useState, useEffect, useContext} from 'react';
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import apiClient from "../shared/apiClient";

// 초기값을 null로 설정한 Context 생성
const LoginContext = createContext();

// Provider 컴포넌트 생성
export const LoginProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === "true";
  });

  const handleLoginSuccess = async() => {
    setIsLoggedIn(true);
  };

  const handleLogoutSuccess = async() => {
    console.log("로그아웃 성공");
    await initLocalStorage();
  };

  const handleLoginFail = async() => {
    console.log("로그인 실패");
    await initLocalStorage();
  };

  const initLocalStorage = async () => {
    // 좌석 상태를 오프라인으로 업데이트하는 요청 보내기
    try {
      const id = localStorage.getItem("userId");
      const memberId = id.toString();
      await apiClient.post("/logout", { memberId });
      console.log("좌석 상태를 오프라인으로 업데이트 완료");
    } catch (error) {
      console.error("좌석 상태 업데이트 중 오류 발생:", error);
    }
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("seatInfo");
    Cookies.remove("refreshToken");
    navigate("/"); // 로그인 페이지로 리다이렉트
  };

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('isLoggedIn', "true");
    } else {
      localStorage.setItem('isLoggedIn', "false");
    }
  }, [isLoggedIn]);

  return (
    <LoginContext.Provider value={{ isLoggedIn, handleLoginSuccess, handleLogoutSuccess, handleLoginFail }}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => {
  return useContext(LoginContext);
}
