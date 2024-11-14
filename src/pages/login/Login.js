import React, { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Router from "../../shared/Router";
import Grid from "@mui/material/Grid2";
import HomeImage from "../../assets/images/homeImage6.jpeg";
import backImage from "../../assets/images/photo_01_satur_-60.jpg";
import logo from "../../assets/images/logo.png";
import socket from "../../utils/socket";
import apiClient from "../../shared/apiClient";

function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const navigate = useNavigate();


  useEffect(() => {
    console.log("isLoggedIn 상태 변경:", isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = Cookies.get("refreshToken");

      socket.emit("fetchData", token);

      console.log(token);

      if (token && isTokenValid(token)) {
        setIsLoggedIn(true);
        if (socket) {
          console.log('Token updated');
          socket.emit('token', token);
        }
      } else if (refreshToken) {
        try {

          const response = await axios.post(
            "http://175.106.99.175:8080/api/auth/refresh",
            {
              value: refreshToken,
            },
            {
              withCredentials: true,
            }
          );
          localStorage.setItem("token", response.data.accessToken);
          setIsLoggedIn(true);

          if (socket) {
            console.log('Token updated');
            socket.emit('token', response.data.accessToken);
          }
        } catch (error) {
          console.error("Refresh token failed:", error);
          handleLoginFail();
          console.log("1=======> 로그인 페이지로");
          navigate("/"); // 로그인 페이지로 리다이렉트
        }
      } else {
        console.log("2=======> 로그인 페이지로");
        handleLoginFail();
        navigate("/"); // 로그인 페이지로 리다이렉트
      }
    };

    checkToken();
    setIsLoading(false);
  }, [navigate]);

  const isTokenValid = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const { exp } = JSON.parse(jsonPayload);

      return exp > Date.now() / 1000;
    } catch (error) {
      console.error("Token is invalid:", error);
      return false;
    }
  };

  const handleLoginSuccess = () => {
    console.log("로그인");
    setIsLoggedIn(true);

    if (socket) {
      console.log('Token updated');
      socket.emit('token', localStorage.getItem("token"));
    }
  };
  const handleLoginFail = async () => {
    console.log("로그인 실패");
    // 좌석 상태를 오프라인으로 업데이트하는 요청 보내기
    try {
      const id = localStorage.getItem("userId");
      const memberId = id.toString();
      console.log(memberId);
      console.log("memberId===>", memberId);
      await apiClient.post("/logout", { memberId });
      console.log("좌석 상태를 오프라인으로 업데이트 완료");
    } catch (error) {
      console.error("좌석 상태 업데이트 중 오류 발생:", error);
    }
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("membertype");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("seatInfo");
    localStorage.removeItem("userId");
    Cookies.remove("refreshToken");
    navigate("/"); // 로그인 페이지로 리다이렉트
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>; // 로딩 중 메시지
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      {isLoggedIn ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
          }}
        >
          <Router></Router>
        </Box>
      ) : (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
            // backgroundColor: "#34495e",
            // backgroundColor: "#f4f4f4",
            backgroundImage: `url(${backImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Box
            sx={{
              height: "100%",
              white: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              zIndex: 1,
            }}
          ></Box>
          <Box
            container
            spacing={0}
            sx={{
              borderRadius: "14px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
              display: "flex",
              width: "65%",
              height: "80%",
              zIndex: 2,
            }}
          >
            <Grid
              sx={{
                width: "50%",
                borderRight: "1px solid #f4f4f4",
                backgroundColor: "white",
                borderRadius: "14px 0 0 14px",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "14px 0 0 14px",
                  backgroundImage: `url(${HomeImage})`,
                  backgroundSize: "contain", // 이미지 크기 조정
                  backgroundPosition: "center", // 이미지 위치 조정
                  backgroundRepeat: "no-repeat", // 이미지 반복 방지
                }}
              />
            </Grid>
            <Grid
              sx={{
                width: "50%",
                backgroundColor: "white",
                borderRadius: "0 14px 14px 0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  alignContent: "center",
                  width: "100%", // 추가: 부모 요소의 너비를 100%로 설정
                  textAlign: "center", // 추가: 텍스트 중앙 정렬
                  alignItems: "center",
                }}
              >
                <img
                  src={logo} // 이미지 경로 설정
                  alt="ClazzBridge Logo"
                  style={{
                    width: "100%", // 너비를 100%로 설정
                    height: "auto", // 높이를 자동으로 설정하여 비율 유지
                    maxWidth: "300px", // 원하는 최대 너비 설정 (예: 300px)
                  }}
                />
              </Box>
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            </Grid>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Login;
