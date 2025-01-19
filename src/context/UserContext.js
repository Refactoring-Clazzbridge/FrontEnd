// UserContext.js
import React, {createContext, useState, useEffect, useContext} from "react";

// 초기값을 null로 설정한 Context 생성
const UserContext = createContext();

// Provider 컴포넌트 생성
export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    // 로컬 스토리지에서 초기값 가져오기
    const savedUserInfo = localStorage.getItem("userInfo");
    return savedUserInfo ? JSON.parse(savedUserInfo) : null;
  });

  // Promise를 반환하는 updateUserInfo 함수
  const updateUserInfo = (newUserInfo) => {
    setUserInfo(newUserInfo);
    localStorage.setItem("userInfo", JSON.stringify(newUserInfo));
  };

  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
}
