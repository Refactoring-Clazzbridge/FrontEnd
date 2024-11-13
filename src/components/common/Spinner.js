import React from "react";
import CircularProgress from "@mui/material/CircularProgress"; // MUI CircularProgress 임포트
import { Box } from "@mui/material"; // Box 컴포넌트 임포트

const Spinner = ({ visible }) => (
  <Box
    display={visible ? "flex" : "none"}
    justifyContent="center"
    alignItems="center"
    height="100vh"
  >
    <CircularProgress />
  </Box>
);

export default Spinner; // 스피너 컴포넌트 내보내기
