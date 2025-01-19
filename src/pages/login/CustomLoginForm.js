import backImage from "../../assets/images/photo_01_satur_-60.jpg";
import {Box} from "@mui/material";
import Grid from "@mui/material/Grid2";
import HomeImage from "../../assets/images/homeImage6.jpeg";
import logo from "../../assets/images/logo.png";
import LoginForm from "./LoginForm";
import React from "react";
import {useLogin} from "../../context/LoginContext";

export const CustomLoginForm = () => {

  return(
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
            <LoginForm/>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};
