// UserContext.js
import React, { createContext, useState, useEffect } from "react";

// 초기값을 null로 설정한 Context 생성
export const UserContext = createContext();

// Provider 컴포넌트 생성ㄴ
export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    // 로컬 스토리지에서 초기값 가져오기
    const savedUserInfo = localStorage.getItem("userInfo");
    return savedUserInfo ? JSON.parse(savedUserInfo) : null;
  });

  useEffect(() => {
    // userInfo가 변경될 때마다 로컬 스토리지에 저장
    if (userInfo) {
      console.log(userInfo);
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    } else {
      localStorage.removeItem("userInfo"); // userInfo가 null일 경우 로컬 스토리지에서 제거
    }
  }, [userInfo]);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};
