import { React, useContext } from "react";
import { UserContext } from "../context/UserContext";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
} from "@mui/material";

export default function Home() {
  const { userInfo } = useContext(UserContext);

  // 예시 데이터
  const newPostsCount = 5; // 새로 올라온 게시글 수
  const totalStudents = 23; // 총 수강생 인원 수정
  const attendedStudents = 19; // 출석한 수강생 수
  const recentActivities = [
    "사용자 A가 게시글을 작성했습니다.",
    "사용자 B가 댓글을 남겼습니다.",
    "사용자 C가 게시글을 좋아요 했습니다.",
  ]; // 최근 활동

  // 학원 일정 데이터
  const courseName = "웹 개발 과정";
  const startDate = new Date("2024-05-24"); // 시작 날짜 수정
  const endDate = new Date("2024-12-03"); // 종료 날짜 수정
  const today = new Date();
  const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  const daysRemaining = totalDays - daysPassed;

  // 진행 상황 비율 계산
  const progressPercentage = Math.round((daysPassed / totalDays) * 100);

  // 출석률 예시 데이터
  const attendanceRate = 85; // 출석률

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        height: "100vh",
        padding: "20px",
      }}
    >
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              position: "relative",
              padding: "40px",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "0",
                height: "0",
                borderLeft: "20px solid transparent",
                borderRight: "20px solid transparent",
                borderTop: "20px solid #ffffff",
              },
            }}
          >
            {userInfo && userInfo.member ? (
              <Typography variant="h4" sx={{ fontWeight: 600, color: "#333" }}>
                환영합니다, {userInfo.member.name}님!
              </Typography>
            ) : (
              <Typography variant="h5" sx={{ color: "#666" }}>
                Home
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* 새로 올라온 게시글 수 카드 */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              padding: "20px",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 500, color: "#333" }}>
              새로 올라온 게시글 수
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, color: "#007aff" }}>
              {newPostsCount}
            </Typography>
          </Paper>
        </Grid>

        {/* 총 수강생 인원 카드 수정 */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              padding: "20px",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 500, color: "#333" }}>
              총 수강생 인원
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, color: "#007aff" }}>
              {totalStudents}명
            </Typography>
          </Paper>
        </Grid>

        {/* 출석한 수강생 수 카드 수정 */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              padding: "20px",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 500, color: "#333" }}>
              출석한 수강생 수
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, color: "#007aff" }}>
              {attendedStudents}명
            </Typography>
          </Paper>
        </Grid>

        {/* 학원 일정 카드 */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              padding: "20px",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <CircularProgress
                variant="determinate"
                value={progressPercentage}
                sx={{ width: 250, height: 250, marginBottom: "10px" }} // 크기 조정
                color="primary" // 진행된 부분 색상
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#007aff" }}
              >
                {progressPercentage}%
              </Typography>
              <Typography
                sx={{ fontWeight: 500, color: "#333", marginTop: "10px" }}
              >
                과정명: {courseName}
              </Typography>
              <Typography variant="body1" sx={{ color: "#666" }}>
                시작 날짜: {startDate.toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ color: "#666" }}>
                종료 날짜: {endDate.toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ color: "#666" }}>
                경과 일수: {daysPassed}일
              </Typography>
              <Typography variant="body1" sx={{ color: "#666" }}>
                남은 일수: {daysRemaining}일
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 출석률 카드 추가 */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              padding: "20px",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 500, color: "#333" }}>
              출석률
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, color: "#007aff" }}>
              {attendanceRate}%
            </Typography>
          </Paper>
        </Grid>

        {/* 문의하기 버튼 추가 및 크기 조정 */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              padding: "20px",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 500, color: "#333" }}>
              문의하기
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ marginTop: "10px" }}
            >
              문의하기
            </Button>
          </Paper>
        </Grid>

        {/* 새로 올라온 투표 카드 추가 */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              padding: "20px",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 500, color: "#333" }}>
              새로 올라온 투표
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, color: "#007aff" }}>
              2개
            </Typography>
          </Paper>
        </Grid>

        {/* 최근 활동 카드 */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              padding: "20px",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 500, color: "#333" }}>
              최근 활동
            </Typography>
            <Box sx={{ textAlign: "left", marginTop: "10px" }}>
              {recentActivities.map((activity, index) => (
                <Typography key={index} variant="body1" sx={{ color: "#666" }}>
                  • {activity}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
