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
import { UserContext } from "../../context/UserContext";

function LoginForm({ onLoginSuccess }) {
  const [memberId, setmemberId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUserInfo } = useContext(UserContext);

  const minLength = 8;

  const handleLogin = async (event) => {
    event.preventDefault();

    if (password.length < minLength) {
      setError(`비밀번호는 최소 ${minLength}자 이상이어야 합니다.`);
      return;
    }

    setLoading(true);

    try {
      console.log("1111=============>");
      const response = await axios.post("http://localhost:8080/api/login", {
        memberId,
        password,
      });
      console.log("2222=============>");
      console.log(response);

      if (response.data) {
        localStorage.setItem("token", response.data.accessToken);
        const { authResponseDTO: member } = response.data;

        setUserInfo({ member });
        localStorage.setItem("userInfo", JSON.stringify({ member })); // 로컬 스토리지에 저장
        localStorage.setItem("userId", member.id); // 로컬 스토리지에 저장
        localStorage.setItem("membertype", member.memberType); // 로컬 스토리지에 저장


        console.log(
          "response.data.refreshToken: " + response.data.refreshTokenCookie
        );
        document.cookie = `refreshToken=${response.data.refreshTokenCookie.value}; path=/;`;

        onLoginSuccess(memberId);
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
            onChange={(e) => setmemberId(e.target.value)}
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
