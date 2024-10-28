import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../../shared/apiClient";
import { jwtDecode } from "jwt-decode";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import MenuItem from "@mui/material/MenuItem";
import {
  Avatar,
  Card,
  CardContent,
  Typography,
  Badge,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Stack,
  Box,
  TextField,
  Link,
  Button,
} from "@mui/material";
import {
  getCourseId,
  getTeacherByCourseId,
} from "../../services/apis/studentCourse/get";

function ProfileCard({
  seatId,
  name,
  imgSrc,
  isOnline,
  seatNumber,
  isUnderstanding,
  isHandRaised,
  openModal,
  email,
  github,
  phone,
  bio,
  isSelf,
  isEmpty,
  role,
  onRegisterSeatClick,
  userHasSeat,
  isTeacher,
  isStudent,
  isAdmin,
}) {
  const isGoodOnline = isOnline === true;
  const isOffline = isOnline === false;

  const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      backgroundColor: isGoodOnline ? "#28a745" : "#b0b0b0",
      color: "#ffffff",
      boxShadow: `0 0 0 1px ${theme.palette.background.paper}`,
      "&::after": isGoodOnline
        ? {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            animation: "ripple 1.2s infinite ease-in-out",
            border: "1px solid currentColor",
            content: '""',
          }
        : {},
    },
    "@keyframes ripple": {
      "0%": {
        transform: "scale(0.9)",
        opacity: 1,
      },
      "100%": {
        transform: "scale(2.0)",
        opacity: 0,
      },
    },
  }));

  return (
    <Card
      sx={{
        borderRadius: "6px",
        width: "120px",
        textAlign: "center",
        height: "90px",
        boxShadow: isSelf
          ? "0 1px 0px rgba(0, 0, 0, 0.2)"
          : "0 1px 0px rgba(0, 0, 0, 0.1)",
        border:
          !isOffline && isSelf && isUnderstanding
            ? "1px solid #28a745"
            : !isOffline && isSelf && !isUnderstanding
              ? "1px solid transparent"
              : !isOffline && isTeacher && isUnderstanding
                ? "1px solid #28a745"
                : "none",
        backgroundImage:
          !isOffline && isSelf && !isUnderstanding
            ? "linear-gradient(white, white), linear-gradient(to right, #6a0dad, #1e90ff)"
            : "none",
        backgroundOrigin: "border-box",
        backgroundClip: "content-box, border-box",
        filter: isEmpty || isOffline ? "grayscale(100%)" : "none",
        cursor:
          isTeacher || isAdmin || userHasSeat
            ? "default"
            : isEmpty && !userHasSeat
              ? "pointer"
              : "default",
        pointerEvents:
          isEmpty && (isTeacher || isAdmin || userHasSeat)
            ? "none"
            : isTeacher || isAdmin || isStudent
              ? "auto"
              : "none",
      }}
      onClick={
        isTeacher
          ? () =>
              openModal(seatId, name, email, github, phone, bio, imgSrc, isSelf)
          : isEmpty && !userHasSeat && !isTeacher && !isAdmin
            ? () => onRegisterSeatClick()
            : () =>
                openModal(
                  seatId,
                  name,
                  email,
                  github,
                  phone,
                  bio,
                  imgSrc,
                  isSelf
                )
      }
    >
      <CardContent sx={{ padding: "6px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "#f4f4f9",
            alignItems: "center",
            position: "relative",
            padding: "0px",
            marginLeft: "-9px",
            marginRight: "-9px",
            top: "-9px",
            height: "20px",
          }}
        >
          <Typography
            sx={{
              fontSize: "10px",
              fontWeight: "500",
              color: isGoodOnline ? "#333" : "#b0b0b0",
              margin: "4px",
            }}
          >
            {`No. ${seatNumber}`}
          </Typography>
        </div>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isEmpty && !userHasSeat && isStudent ? (
              <AddIcon
                sx={{
                  position: "absolute",
                  height: "20px",
                  width: "20px",
                  color: "darkGray",
                  marginTop: "50px",
                }}
              />
            ) : !isEmpty ? (
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
              >
                <Avatar
                  sx={{
                    width: "30px",
                    height: "30px",
                    filter: isOffline ? "grayscale(100%)" : "none",
                    cursor: "pointer",
                    border: "1px solid #ddd",
                    boxShadow: "0 1px 2px",
                  }}
                  src={imgSrc}
                  alt={`${name}'s profile`}
                />
              </StyledBadge>
            ) : null}
          </Box>
        </Stack>
        {(!isEmpty || isTeacher || isAdmin) && (
          <Typography
            sx={{
              marginTop: "4px",
              fontSize: "12px",
              fontWeight: "600",
              color: isGoodOnline ? "#333" : "#b0b0b0",
            }}
          >
            {name}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function StudentRoom() {
  const [open, setOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false); // 좌석 등록 다이얼로그 상태 추가
  const [openSeatDialog, setOpenSeatDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [seatCount, setSeatCount] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [currentProfile, setCurrentProfile] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [userSeat, setUserSeat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [seatRegisteredWarning, setSeatRegisteredWarning] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [seatId, setSeatId] = useState(null);
  const [isOnline, setIsOnline] = useState(false); // 좌석 상태 관리

  useEffect(() => {
    // 컴포넌트가 마운트될 때 localStorage에서 좌석 정보를 가져옴
    const storedSeatId = localStorage.getItem("userHasSeat");
    if (storedSeatId) {
      setUserSeat(storedSeatId); // 저장된 좌석 ID를 상태로 설정
    }
  }, []);

  const handleStudentSeatRegistration = async (seatId) => {
    const seatUpdateDTO = {
      id: seatId,
      memberId: currentUser.memberId,
      courseId: selectedCourseId,
      isOnline: true,
    };

    try {
      const response = await apiClient.put("seat/assign", seatUpdateDTO);
      if (response.status === 200) {
        console.log("좌석 등록 성공:", response.data);

        // 좌석 등록 후 최신 좌석 정보를 다시 불러와서 로컬 상태와 동기화
        await fetchSeatsByCourse(selectedCourseId);

        // 좌석 상태 업데이트
        setUserSeat(seatId);
        localStorage.setItem("userHasSeat", seatId);

        handleCancelRegisterSeat();
      } else {
        console.error("좌석 등록 실패:", response.data);
      }
    } catch (error) {
      console.error("좌석 등록 중 오류 발생:", error);
    }
  };

  const handleStudentSeatRelease = async (seatId) => {
    try {
      const response = await apiClient.delete(`seat/${seatId}`);

      if (response.status === 200) {
        console.log("좌석 해제 성공:", response.data);

        // 좌석 해제 후 최신 좌석 정보를 다시 불러와서 로컬 상태와 동기화
        await fetchSeatsByCourse(selectedCourseId);

        // 좌석 상태 업데이트
        setUserSeat(null);
        localStorage.removeItem("userHasSeat");

        setReleaseDialogOpen(false);
        closeProfileModal();
      } else {
        console.error("좌석 해제 실패:", response.data);
      }
    } catch (error) {
      console.error("좌석 해제 중 오류 발생:", error);
    }
  };

  const handleRegisterSeats = async () => {
    try {
      const seatsRegistered = await checkIfSeatsRegistered();

      if (seatsRegistered) {
        setSeatRegisteredWarning(true);
        return;
      }

      const response = await apiClient.post("seat/register", null, {
        params: {
          seatCount: seatCount,
          courseId: selectedCourseId,
        },
      });
      setProfiles(response.data);
      setOpenSeatDialog(false);
    } catch (error) {
      console.error("좌석 등록 중 오류 발생:", error);
    }
  };

  const handleDeleteSeats = async () => {
    try {
      await apiClient.delete("seat/deleteAllSeats", {
        params: {
          courseId: selectedCourseId,
        },
      });
      setProfiles([]);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("좌석 삭제 중 오류 발생:", error);
    }
  };

  const handleCancelRegisterSeat = () => {
    setRegisterDialogOpen(false); // 좌석 등록 다이얼로그 닫기
  };

  const fetchStudentCourse = async () => {
    try {
      const response = await apiClient.get(`studentCourses`);
      const fetchedCourseId = response.data;

      setCourseId(fetchedCourseId);
      setSelectedCourseId(fetchedCourseId);

      setCurrentUser((prevUser) => ({
        ...prevUser,
        courseId: fetchedCourseId,
      }));

      fetchSeatsByCourse(fetchedCourseId);
    } catch (error) {
      console.error(
        "강의 정보를 불러오는 중 오류가 발생했습니다. fetchStudentCourse ",
        error
      );
    }
  };

  // 특정 사용자의 좌석 상태를 가져오는 함수
  const fetchSeatStatus = async (memberId) => {
    try {
      const response = await apiClient.get(`seat/status/${memberId}`);
      if (response.status === 200 && response.data) {
        const seatStatus = response.data;
        setIsOnline(seatStatus.isOnline); // 좌석 상태 업데이트
      } else {
        setIsOnline(false); // 좌석 상태가 없으면 오프라인으로 설정
      }
    } catch (error) {
      console.error("좌석 상태를 가져오는 중 오류 발생: ", error);
      setIsOnline(false);
    }
  };

  useEffect(() => {
    const fetchCourseAndSeats = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        const decodedToken = jwtDecode(token);
        const memberType = decodedToken.role;

        setCurrentUser({
          memberId: decodedToken.id,
          memberType: memberType,
          courseId: null,
        });

        if (memberType === "ROLE_STUDENT" || memberType === "ROLE_TEACHER") {
          try {
            let courseId = null;
            if (memberType === "ROLE_STUDENT") {
              courseId = await getCourseId();
            }
            if (memberType === "ROLE_TEACHER") {
              courseId = await getTeacherByCourseId();
            }
            setSelectedCourseId(courseId);
            fetchSeatsByCourse(courseId); // courseId로 좌석 정보 가져오기
          } catch (error) {
            console.error("Error fetching course ID:", error);
          }
        } else {
          fetchStudentCourse();
        }
      }
    };

    fetchCourseAndSeats(); // 비동기 함수 호출
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await apiClient.get("course/select");
      setCourses(response.data);
    } catch (error) {
      console.error(
        "강의 목록을 불러오는 중 오류가 발생했습니다. fetchCourses ",
        error
      );
    }
  }, []);

  useEffect(() => {
    if (
      currentUser &&
      (currentUser.memberType === "ROLE_ADMIN" ||
        currentUser.memberType === "ROLE_TEACHER")
    ) {
      fetchCourses();
    }
  }, [fetchCourses, currentUser]);

  const fetchSeatsByCourse = async (courseId) => {
    try {
      const response = await apiClient.get(`/seat/course/${courseId}`);
      const sortedSeats = response.data.sort(
        (a, b) => a.seatNumber - b.seatNumber
      );
      setProfiles(sortedSeats);
    } catch (error) {
      console.error(
        "좌석 정보를 불러오는 중 오류가 발생했습니다 fetchSeatsByCourse :",
        error
      );
    }
  };

  const checkIfSeatsRegistered = async () => {
    try {
      const response = await apiClient.get(`seat/course/${selectedCourseId}`);
      return response.data.length > 0;
    } catch (error) {
      console.error(
        "좌석 등록 여부 확인 중    발생 checkIfSeatsRegistered :",
        error
      );
      return false;
    }
  };

  const handleSeatRegistration = async (seatId) => {
    try {
      const response = await apiClient.post(`/seat/register/${seatId}`, {
        courseId: selectedCourseId,
      });

      setProfiles(response.data);
    } catch (error) {
      console.error("좌석 등록 중 오류 발생 handleSeatRegistration :", error);
    }
  };

  const openProfileModal = (
    seatId,
    name,
    email,
    github,
    phone,
    bio,
    imgSrc,
    isSelf
  ) => {
    setCurrentProfile({
      seatId,
      name,
      email,
      github,
      phone,
      bio,
      imgSrc,
      isSelf,
      memberId: currentUser.memberId,
    });
    setOpen(true);
  };

  const closeProfileModal = () => {
    setOpen(false);
  };

  return (
    <div>
      {currentUser && currentUser.memberType === "ROLE_ADMIN" && (
        <Box
          sx={{
            width: "330px",
            height: "4px",
            marginBottom: "60px",
            marginLeft: "63px",
          }}
        >
          <TextField
            sx={{
              width: "330px",
              height: "4px",
            }}
            select
            id="courseSelect"
            label="강의 선택"
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              fetchSeatsByCourse(e.target.value);
            }}
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.courseTitle}
              </MenuItem>
            ))}
          </TextField>

          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenSeatDialog(true)}
              sx={{ left: 1140 }}
            >
              좌석 등록
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setOpenDeleteDialog(true)}
              sx={{ left: 1150 }}
            >
              좌석 삭제
            </Button>
          </Box>
        </Box>
      )}

      {selectedCourseId && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 200px)",
            gap: "12px",
            padding: "16px",
            justifyContent: "center",
            maxWidth: "1400px",
            margin: "0 auto",
            marginTop:
              currentUser &&
              (currentUser.memberType === "ROLE_ADMIN" ||
                currentUser.memberType === "ROLE_TEACHER")
                ? "40px"
                : "0",
          }}
        >
          {profiles.map((profile, index) => (
            <ProfileCard
              key={profile.id}
              seatNumber={profile.seatNumber}
              seatId={profile.id}
              name={profile.member ? profile.member.name : ""}
              imgSrc={profile.member ? profile.member.avatarImageUrl : ""}
              email={profile.member ? profile.member.email : ""}
              github={profile.member ? profile.member.gitUrl : ""}
              phone={profile.member ? profile.member.phone : ""}
              bio={profile.member ? profile.member.bio : ""}
              isOnline={profile.isOnline}
              isUnderstanding={
                profile.member?.studentStatusDTO?.isUnderstanding ?? false
              }
              isHandRaised={
                profile.member?.studentStatusDTO?.isHandRaised ?? false
              }
              isSelf={
                profile.member && profile.member.id === currentUser.memberId
              }
              isEmpty={!profile.member}
              openModal={openProfileModal}
              userHasSeat={
                userSeat !== null && currentUser.memberType === "ROLE_STUDENT"
              }
              isAdmin={currentUser.memberType === "ROLE_ADMIN"}
              isTeacher={currentUser.memberType === "ROLE_TEACHER"}
              isStudent={currentUser.memberType === "ROLE_STUDENT"}
              // onRegisterSeatClick={() => handleSeatRegistration(profile.id)}
              onRegisterSeatClick={() => {
                console.log(profile, "profile");
                setRegisterDialogOpen(true);
                setSelectedSeat(profile.seatNumber);
                setSeatId(profile.id);
              }}
            />
          ))}
        </div>
      )}

      <Dialog open={open} onClose={closeProfileModal}>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: 1,
            }}
          >
            <Avatar
              src={currentProfile.imgSrc}
              alt={`${currentProfile.name}'s profile`}
              sx={{ width: 100, height: 100, mt: 1, mb: 1 }}
            />
            <Box sx={{ width: "100%", mt: 1 }}>
              {[
                { label: "Name", value: currentProfile.name },
                { label: "Phone Number", value: currentProfile.phone },
                { label: "Email", value: currentProfile.email },
                { label: "GitHub", value: currentProfile.github, isLink: true },
                { label: "Bio", value: currentProfile.bio, isMultiline: true },
              ].map((item, index) => (
                <Box key={index} sx={{ mt: 1 }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontSize: "0.7rem" }}
                  >
                    {item.label}
                  </Typography>
                  {item.isLink ? (
                    <Link
                      href={item.value}
                      target="_blank"
                      style={{ textDecoration: "none" }}
                    >
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={item.value}
                        InputProps={{ readOnly: true }}
                        sx={{ fontSize: "0.55rem" }}
                      />
                    </Link>
                  ) : (
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={item.value}
                      InputProps={{
                        readOnly: true,
                        style: { pointerEvents: "none" },
                      }}
                      multiline={item.isMultiline}
                      rows={item.isMultiline ? 3 : 1}
                      sx={{ fontSize: "0.55rem" }}
                    />
                  )}
                </Box>
              ))}
            </Box>
            {currentProfile.isSelf && (
              <Button variant="text" onClick={() => setReleaseDialogOpen(true)}>
                자리 해제
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={openSeatDialog} onClose={() => setOpenSeatDialog(false)}>
        <DialogTitle>좌석 등록</DialogTitle>
        <DialogContent>
          <Typography>등록할 좌석 수를 입력하세요.</Typography>
          <TextField
            autoFocus
            margin="dense"
            label="좌석 수"
            type="number"
            fullWidth
            variant="standard"
            value={seatCount}
            onChange={(e) => setSeatCount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSeatDialog(false)}>취소</Button>
          <Button onClick={handleRegisterSeats}>등록</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={seatRegisteredWarning}
        onClose={() => setSeatRegisteredWarning(false)}
      >
        <DialogTitle>좌석 등록 불가</DialogTitle>
        <DialogContent>
          <Typography>
            이미 좌석이 등록되어 있습니다. 삭제 후 재등록 해주세요.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeatRegisteredWarning(false)}>확인</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>좌석 삭제</DialogTitle>
        <DialogContent>
          <Typography>정말로 좌석을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>취소</Button>
          <Button onClick={handleDeleteSeats} color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 좌석 해제 확인 다이얼로그 */}
      <Dialog
        open={releaseDialogOpen}
        onClose={() => setReleaseDialogOpen(false)}
      >
        <DialogTitle>자리 해제 하시겠습니까?</DialogTitle>
        <DialogActions>
          <Button
            onClick={() => handleStudentSeatRelease(currentProfile.seatId)}
            color="primary"
          >
            해제
          </Button>
          <Button onClick={() => setReleaseDialogOpen(false)} color="secondary">
            취소
          </Button>
        </DialogActions>
      </Dialog>

      {/* 좌석 등록 확인 다이얼로그 */}
      <Dialog open={registerDialogOpen} onClose={handleCancelRegisterSeat}>
        <DialogTitle>{selectedSeat}번 좌석에 등록하시겠습니까?</DialogTitle>
        <DialogActions>
          <Button
            onClick={() => handleStudentSeatRegistration(seatId)}
            color="primary"
          >
            등록
          </Button>
          <Button onClick={handleCancelRegisterSeat} color="secondary">
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
