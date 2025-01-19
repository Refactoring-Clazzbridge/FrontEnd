import "./App.css";
import React, { useEffect, useState } from "react";
import { SidebarProvider } from "./context/SidebarContext";
import Login from "./pages/login/Login";
import Router from "./shared/Router";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { SocketProvider } from "./context/SocketContext";
import {LoginProvider, useLogin} from "./context/LoginContext";
import {TokenProvider} from "./context/TokenContext";
import {CustomLoginForm} from "./pages/login/CustomLoginForm";
import {Provider} from "react-redux";
import store from "./redux/store";

const theme = createTheme({
  typography: {
    fontFamily: "Pretendard-Regular", // 선택한 폰트 설정
  },
});

function App() {

  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <UserProvider>
          <SidebarProvider>
            <LoginProvider>
              <TokenProvider>
                <SocketProvider>
                  <Login/>
                </SocketProvider>
              </TokenProvider>
            </LoginProvider>
          </SidebarProvider>
        </UserProvider>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
