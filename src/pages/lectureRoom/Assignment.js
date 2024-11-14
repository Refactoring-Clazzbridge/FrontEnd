import React, { useState, useEffect, useCallback } from "react";
import AssignmentItem from "../../components/assignment/AssignmentItem";
import { getStudentCourseId } from "../../services/apis/studentCourse/get";
import { Button, Tooltip, Box, TextField, Tabs, Tab } from "@mui/material";
import CustomModal from "../../components/common/CustomModal";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { getAssignmentsByCourseId } from "../../services/apis/assignment/get";
import { getAllAssignments } from "../../services/apis/assignment/get"; // getAllSubmissions API import
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { createAssignment } from "../../services/apis/assignment/post";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import CustomSnackbar from "../../components/common/CustomSnackbar";
import moment from "moment";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../styles/assignment.css";

export default function AssignmentAccordion() {
  const [currentUser, setCurrentUser] = useState(null);
  const [studentCourseId, setStudentCourseId] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState(null);

  const [openSnackbar, setOpenSnackbar] = useState(false); // 스낵바 열기 상태
  const [snackbarMessage, setSnackbarMessage] = useState(""); // 스낵바 메시지
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 스낵바 성공/실패 유무

  const [assignments, setAssignments] = useState([]); // assignments 상태 추가

  const [selectedTab, setSelectedTab] = useState("all"); // 탭 상태 추가

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        [{ align: [] }], // 문단 정렬 추가
        [{ list: "ordered" }, { list: "bullet" }], // 번호 매기기 및 글머리 기호 추가
        ["bold", "italic", "underline"],
        ["link", "image"],
        ["code-block"], // 코드 블록 추가
        ["clean"],
      ],
    },
  };

  const fetchStudentCourseId = useCallback(async () => {
    if (currentUser) {
      try {
        const result = await getStudentCourseId();
        setStudentCourseId(result.id);
        setCourseId(result.courseId);
        setCourseTitle(result.courseTitle);
      } catch (error) {
        console.error("Failed to fetch student course ID:", error);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    const userInfoString = localStorage.getItem("userInfo");
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);
      setCurrentUser(userInfo);
    }
  }, []);

  useEffect(() => {
    fetchStudentCourseId();
  }, [fetchStudentCourseId]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setContent("");
    setDueDate(null);
  };

  const handleTitleChange = (event) => setTitle(event.target.value);
  const handleContentChange = (value) => setContent(value);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleDueDateChange = (newDate) => {
    if (isNaN(newDate)) {
      showSnackbar(
        "유효하지 않은 날짜 형식입니다. YYYY-MM-DD 형식으로 입력해 주세요.",
        "error"
      );
      return;
    }
    if (newDate) {
      const formattedDate = format(newDate, "yyyy-MM-dd");
      setDueDate(formattedDate);
    } else {
      setDueDate(null);
    }
  };

  const handleSubmit = async () => {
    const assignmentRequestDTO = {
      courseId: courseId,
      title: title,
      description: content,
      dueDate: "",
    };

    const today = moment().startOf("day");
    const dueDateMoment = moment(dueDate, "YYYY-MM-DD");

    if (dueDateMoment.isBefore(today)) {
      showSnackbar("만기일은 오늘 이후로 설정해야 합니다.", "error");
      return;
    }

    const formattedDueDate = moment(dueDate).format("YYYY-MM-DD");
    assignmentRequestDTO.dueDate = formattedDueDate;

    try {
      console.log(assignmentRequestDTO, "assignmentRequestDTO");
      await createAssignment(assignmentRequestDTO);
      showSnackbar("과제가 성공적으로 등록되었습니다.", "success");
      closeModal();
      await fetchAssignments();
    } catch (error) {
      console.error(
        "Error fetching assignments:",
        error.response ? error.response.data : error.message
      );
      showSnackbar("과제 등록에 실패했습니다.", "error");
    }
  };

  const fetchAssignments = useCallback(async () => {
    try {
      let fetchedAssignments;
      if (
        currentUser &&
        currentUser.member &&
        currentUser.member.memberType === "ROLE_ADMIN"
      ) {
        fetchedAssignments = await getAllAssignments();
      } else {
        fetchedAssignments = await getAssignmentsByCourseId(courseId);
      }
      setAssignments(fetchedAssignments);
    } catch (error) {
      console.error("과제 목록을 가져오는 데 오류가 발생했습니다.", error);
    }
  }, [courseId, currentUser]);

  useEffect(() => {
    if (currentUser || courseId) {
      fetchAssignments(); // 과제 가져오기 호출
    }
  }, [currentUser, courseId, fetchAssignments]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      {/* 과제 등록 버튼 */}
      {currentUser &&
        currentUser.member &&
        currentUser.member.memberType === "ROLE_TEACHER" && (
          <Box sx={{ marginBottom: "16px" }}>
            <Tooltip title="과제 작성">
              <Button
                variant="outlined"
                sx={{ height: "38px" }}
                onClick={openModal}
              >
                과제 등록
              </Button>
            </Tooltip>
          </Box>
        )}

      <Box sx={{ marginBottom: "16px" }}>
        {/* 내비바 시작 */}
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              minWidth: "auto",
              padding: "8px 16px",
              fontSize: "14px",
              // fontWeight: selectedTab === "all" ? "bold" : "normal",
              color: "#666",
              "&.Mui-selected": {
                color: "#34495e",
                fontWeight: "bold",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#34495e",
            },
          }}
        >
          <Tab label="전체" value="all" />
          <Tab label="진행 중" value="웅" />
          <Tab label="마감 완료" value="웅냥" />
          {/* {courseTitle.map((type) => (
          <Tab key={type.id} label={type.type} value={type.type} />
        ))} */}
        </Tabs>
        {/* 내비바 끝 */}
      </Box>

      <AssignmentItem
        currentUser={currentUser}
        courseId={courseId}
        studentCourseId={studentCourseId}
        fetchAssignments={fetchAssignments}
        assignments={assignments} // assignments props 전달
      />

      <CustomModal isOpen={isModalOpen} closeModal={closeModal}>
        <Box
          sx={{
            display: "flex",
            margin: "auto",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "20px",
            height: "100%",
          }}
        >
          <h3>과제 작성</h3>

          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              gap: 2,
            }}
          >
            <TextField
              label="강의명"
              disabled
              variant="outlined"
              value={courseTitle || ""}
              sx={{
                width: "60%",
                "& .MuiInputBase-input": {
                  color: "black", // 비활성화 상태의 텍스트 색상
                },
              }}
            />
            <DatePicker
              label="만기일"
              value={dueDate ? parseISO(dueDate) : null}
              onChange={handleDueDateChange}
              format="yyyy/MM/dd"
              renderInput={{ textField: (props) => <TextField {...props} /> }}
              sx={{ width: "40%" }}
            />
          </Box>

          <TextField
            fullWidth
            label="제목"
            variant="outlined"
            onChange={handleTitleChange}
            value={title}
          />

          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleContentChange}
            modules={modules}
            style={{ width: "100%", minHeight: "200px" }}
          />

          <Box
            sx={{
              display: "flex",
              margin: "auto",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: "24px",
            }}
          >
            <Button
              variant="outlined"
              onClick={closeModal}
              sx={{
                width: "120px",
                height: "40px",
                borderColor: "#34495e",
                color: "#34495e",
              }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              style={{ backgroundColor: "#34495e" }}
              sx={{ width: "120px", height: "40px", fontWeight: 600 }}
            >
              등록하기
            </Button>
          </Box>
        </Box>
      </CustomModal>

      {/* 커스텀 스낵바 */}
      <CustomSnackbar
        open={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleCloseSnackbar}
      />
    </LocalizationProvider>
  );
}
