import React, { useContext, useState, useEffect } from "react";
import apiClient from "../../shared/apiClient";
import {useUser} from "../../context/UserContext";
import CustomSnackbar from "../../components/common/CustomSnackbar"; // 커스텀 스낵바

import {
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  TextField,
  Box,
  Typography,
  Container,
  CssBaseline,
  Alert,
  Grid,
} from "@mui/material";

// 아바타 이미지 파일들을 가져옵니다.
import avatar1 from "../../assets/images/image1.jpeg";

const ProfileForm = () => {
  const [profile, setProfile] = useState({
    name: "",
    memberId: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
    gitUrl: "",
    bio: "",
    avatarImage: "", // 프로필 이미지 ID 초기값
    privacy: "private", // 공개/비공개 기본값 설정
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { updateUserInfo } = useUser();

  const [openSnackbar, setOpenSnackbar] = useState(false); // 스낵바 열기 상태
  const [snackbarMessage, setSnackbarMessage] = useState(""); // 스낵바 메시지
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 스낵바 성공/실패 유무
  const handleCloseSnackbar = () => {
      setOpenSnackbar(false); // 스낵바 닫기
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("=================> 프로필 확인", token);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (token) {
      try {

        const userId = userInfo.member.id; // userId 추출

        apiClient
          .get(`userlist/${userId}`)
          .then((response) => {
            console.log("서버에서 받은 응답:", response.data);
            setProfile(response.data);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching profile", error);
            setLoading(false);
          });
      } catch (error) {
        console.error("Invalid token", error); // 잘못된 토큰 처리
      }
    }
  }, []);

  const selectedAvatar = profile.avatarImage.id
    ? profile.avatarImage.avatarImageUrl
    : avatar1; // 기본 아바타 설정

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^(01[016789])-\d{3,4}-\d{4}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevState) => {
      const updatedProfile = { ...prevState, [name]: value };
      let newError = "";
      if (
        (name === "password" && name === "confirmPassword") &&
        updatedProfile.password !== updatedProfile.confirmPassword
      ) {
        newError = "비밀번호가 일치하지 않습니다.";
      } else if (name === "email" && !emailPattern.test(value)) {
        newError = "올바른 이메일 형식이 아닙니다.";
      } else if (name === "phone" && !phonePattern.test(value)) {
        newError = "올바른 전화번호 형식이 아닙니다.";
      }
      setError(newError);
      return updatedProfile;
    });
  };

  const handlePrivacyChange = (e) => {
    setProfile((prevState) => ({ ...prevState, privacy: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (profile.password !== profile.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!emailPattern.test(profile.email)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    apiClient
      .put("userlist", profile)
      .then((response) => {
        setSnackbarMessage("프로필 정보가 수정되었습니다.");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        handleSubmit2();
      })
      .catch((error) => {
        console.error("변경에 실패하였습니다.", error);
      });
  };

  const handleSubmit2 = (e) => {
    apiClient.post("userlist/update", {
      memberId: profile.memberId,
      password: profile.password,
    })
      .then((response) => {
        const { authResponseDTO: member } = response.data;
        updateUserInfo({ member });
      })
      .catch((error) => {
        console.error("Update failed:", error);
      });
  }


  return (
      <Container component="main" maxWidth="lg" sx={{ mt: 4 }}>
          <CustomSnackbar
              open={openSnackbar}
              message={snackbarMessage}
              severity={snackbarSeverity}
              onClose={handleCloseSnackbar}
          />
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "row", backgroundColor: "" }}>
        {/* 좌측 프로필 이미지 */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={selectedAvatar}
            alt={`${profile.name}'s profile`}
            style={{ width: 250, height: 250, borderRadius: "50%" }}
          />
        </Box>

        {/* 우측 폼 */}
        <Box sx={{ flex: 3, ml: 4 }}>
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            프로필 수정
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* 그리드를 사용하여 2열로 배치 */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="이름"
                  name="name"
                  value={profile.name}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="아이디"
                  name="memberId"
                  value={profile.memberId || ""}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  type="password"
                  label="비밀번호"
                  name="password"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  type="password"
                  label="비밀번호 재확인"
                  name="confirmPassword"
                  value={profile.confirmPassword || ""}
                  onChange={handleChange}
                  error={!!error && error === "비밀번호가 일치하지 않습니다."}
                  helperText={
                    error === "비밀번호가 일치하지 않습니다." ? error : ""
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="이메일"
                  name="email"
                  type="email"
                  value={profile.email || ""}
                  onChange={handleChange}
                  error={!!error && error === "올바른 이메일 형식이 아닙니다."}
                  helperText={
                    error === "올바른 이메일 형식이 아닙니다." ? error : ""
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="GitHub URL"
                  name="gitUrl"
                  value={profile.gitUrl || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  value={profile.phone || ""}
                  onChange={handleChange}
                  label="전화번호"
                  name="phone"
                  error={!!error && error === "올바른 전화번호 형식이 아닙니다."} // 에러 여부 설정
                  fullWidth
                />
                  {error === "올바른 전화번호 형식이 아닙니다." && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                        올바른 전화번호 형식이 아닙니다.<br />
                        예: 010-xxxx-xxxx
                    </Typography>
                    )}
              </Grid>

              {/* 공개/비공개 선택 라디오 버튼 */}
              <Grid item xs={12} sm={6}>
                <FormControl>
                  <RadioGroup
                    row
                    value={profile.privacy}
                    defaultValue="private"
                    onChange={handlePrivacyChange}
                  >
                    <FormControlLabel
                      value="public"
                      control={<Radio />}
                      label="공개"
                    />
                    <FormControlLabel
                      value="private"
                      control={<Radio />}
                      label="비공개"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>

            {/* 자기소개 텍스트박스 */}
            <TextField
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              label="자기소개"
              name="bio"
              value={profile.bio || ""}
              onChange={handleChange}
              sx={{ mt: 3 }}
            />

            {/* 에러 메시지 */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {/* 저장 버튼 */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
            >
              수정
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ProfileForm;
