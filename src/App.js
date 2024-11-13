import "./App.css";
import React, { useEffect, useState } from "react";
import { SidebarProvider } from "./context/SidebarContext";
import Login from "./pages/login/Login";
import Router from "./shared/Router";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { SocketProvider } from "./context/SocketContext";

const theme = createTheme({
  typography: {
    fontFamily: "Pretendard-Regular", // 선택한 폰트 설정
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <SidebarProvider>
          {isLoggedIn ? (
            <Router /> // 로그인 후 Router 화면
          ) : (
            <Login /> // Login 컴포넌트
          )}
        </SidebarProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
