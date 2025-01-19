import React, { useContext, useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Box,
  Container,
  CssBaseline,
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";
import {useUser} from "../../context/UserContext";
import apiClient from "../../shared/apiClient";
import {useToken} from "../../context/TokenContext";
import {useLogin} from "../../context/LoginContext"; // default로 가져오기

function LoginForm() {
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSeatRegistered, setIsSeatRegistered] = useState(false); // 좌석 등록 여부 상태
  const [seatData, setSeatData] = useState(null); // 좌석 정보 상태
  const { updateUserInfo } = useUser() // addCourseIdToUserInfo 사용 가능
  const { token, updateToken } = useToken(); // setToken 사용 가능
  const { handleLoginSuccess } = useLogin(); // handleLoginSuccess 사용 가능

  const minLength = 8;

  const handleLogin = async (event) => {
    event.preventDefault();

    if (password.length < minLength) {
      setError(`비밀번호는 최소 ${minLength}자 이상이어야 합니다.`);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(process.env.REACT_APP_API_URL+"login", {
        memberId,
        password,
      });

      if (response.data) {
        updateToken(response.data.accessToken);
        const { authResponseDTO: member } = response.data;
        updateUserInfo({ member });

        // console.log(
        //   "response.data.refreshToken: " + response.data.refreshTokenCookie
        // );
        document.cookie = `refreshToken=${response.data.refreshTokenCookie.value}; path=/;`;

        await fetchSeatInfo(member.id); // 로그인 성공 후 좌석 정보를 가져오는 로직 추가
        await handleLoginSuccess();
        setError("");
      } else {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 좌석 정보를 서버에서 가져오는 함수
  const fetchSeatInfo = async (memberId) => {
    try {
      const seatResponse = await apiClient.get(`/seat/status/${memberId}`);

      // console.log(seatResponse);

      if (seatResponse.data) {
        const seatInfo = seatResponse.data;
        // console.log("좌석 정보 가져오기 성공:", seatInfo);

        localStorage.setItem("seatInfo", JSON.stringify(seatInfo));

        // 좌석이 등록된 상태로 업데이트
        setIsSeatRegistered(true); // 좌석이 등록되었다고 설정
        setSeatData(seatInfo); // 좌석 정보 저장
      } else {
        setIsSeatRegistered(false); // 좌석 정보가 없으면 미등록 상태로 설정
        console.log("좌석 정보가 없습니다.");
      }
    } catch (error) {
      console.error("좌석 정보를 가져오는 중 오류 발생:", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
          <TextField
            variant="filled"
            margin="normal"
            required
            fullWidth
            id="memberId"
            label="ID"
            name="memberId"
            autoComplete="memberId"
            autoFocus
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            sx={{
              "& .css-1a7v3y2-MuiInputBase-input-MuiFilledInput-input": {
                backgroundColor: "white",
              },
            }}
          />
          <TextField
            variant="filled"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              "& .css-1a7v3y2-MuiInputBase-input-MuiFilledInput-input": {
                backgroundColor: "white",
              },
            }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 3,
                boxShadow: "none",
                p: "14px 10px",
                background: "#34495e",
                borderRadius: "4px",
              }}
            >
              <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                로그인
              </Typography>
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default LoginForm;
