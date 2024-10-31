import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  Box,
  Button,
  TextField,
  Drawer,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CustomModal from "../../components/common/CustomModal";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// 중복된 import를 제거하고, 하나의 올바른 경로로 수정
import { saveQuestionApi } from "../../services/apis/question/post";
import { deleteQuestionsApi } from "../../services/apis/question/delete";
import { getQuestionsByCourseId } from "../../services/apis/question/get";
import { updateQuestionApi } from "../../services/apis/question/put";
import { toggleQuestionRecommendApi } from "../../services/apis/question/put";
import { UserContext } from "../../context/UserContext";
import { getAnswersByQuestionIdApi } from "../../services/apis/answer/get";
import { saveAnswerApi } from "../../services/apis/answer/post";
import { updateAnswerApi } from "../../services/apis/answer/put";
import { deleteAnswerApi } from "../../services/apis/answer/delete";
import { getTeacherCourseId } from "../../services/apis/course/teacherCourseGet";
import { getStudentCourseId } from "../../services/apis/course/studentCourseGet";
import { getAllQuestions } from "../../services/apis/question/get";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { formatDistanceToNow } from "date-fns";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { ko } from "date-fns/locale";

export default function QuestionBoard() {
  // 상태 관리
  const { userInfo } = useContext(UserContext);
  const [rows, setRows] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isAnswerDeleteModalOpen, setIsAnswerDeleteModalOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editedAnswerContent, setEditedAnswerContent] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [courseId, setCourseId] = useState(null); // 강의 ID 상태 추가
  const [type, setType] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // 이벤트 핸들러
  const handleRowClick = async (params) => {
    const clickedRow = params.row;

    // 상세 정보가 없는 경우 서버에서 다시 조회
    try {
      // 여기에 실제 질문 상세 조회 API를 추가하면 더 좋습니다
      // const questionDetail = await getQuestionDetail(clickedRow.id);

      const processedRow = {
        ...clickedRow,
        studentId: clickedRow.studentId || clickedRow.memberId, // studentId가 없으면 memberId 사용
      };

      setSelectedRow(processedRow);
      setOpenDrawer(true);
    } catch (error) {
      console.error("Error processing row click:", error);
    }
  };

  const hasTeacherAlreadyAnswered = useCallback(() => {
    if (!answers || !userInfo?.member?.id) return false;
    return answers.some((answer) => answer.teacherId === userInfo.member.id);
  }, [answers, userInfo?.member?.id]);

  // useEffect 추가 - selectedRow 변경 시 권한 재확인
  useEffect(() => {
    if (selectedRow && userInfo?.member) {
    }
  }, [selectedRow, userInfo]);

  const columns = [
    {
      field: "id",
      headerName: "No",
      flex: 0.5,
      resizable: false,
      sortable: true,
      headerAlign: "left", // 헤더 정렬 추가
      align: "left", // 데이터 정렬 추가
    },
    {
      field: "content",
      flex: 4,
      headerName: "질문",
      resizable: false,
      sortable: true,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: "pre-wrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "recommended",
      flex: 1,
      headerName: "추천 여부",
      resizable: false,
      sortable: true,
      // 추천 여부에 대한 필터 옵션 추가
      type: "boolean",
    },
    {
      field: "solved",
      headerName: "해결 여부",
      flex: 1,
      resizable: false,
      sortable: true,
      // 해결 여부에 대한 필터 옵션 추가
      type: "boolean",
    },
    {
      field: "createdAt",
      flex: 1,
      headerName: "작성날짜",
      resizable: false,
      sortable: true,
      renderCell: (params) => {
        try {
          if (!params?.row?.createdAt) {
            return "날짜 없음";
          }

          const date = new Date(params.row.createdAt);

          if (isNaN(date.getTime())) {
            return "날짜 형식 오류";
          }

          return new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "Asia/Seoul",
          })
            .format(date)
            .replace(/\.$/, "");
        } catch (error) {
          console.error("Date formatting error:", error);
          return "날짜 처리 오류";
        }
      },
    },
  ];

  // 기본 유틸리티 함수
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const resetForm = () => {
    setContent("");
    setNewAnswer("");
    setEditingAnswerId(null);
    setEditedAnswerContent("");
  };

  //초기 데이터 설정
  const fetchQuestions = useCallback(async () => {
    // 관리자가 아닌 경우에만 courseId 체크
    if (type !== "ROLE_ADMIN" && !courseId) {
      return;
    }

    try {
      let data;
      if (type === "ROLE_ADMIN") {
        data = await getAllQuestions();
      } else {
        data = await getQuestionsByCourseId(courseId);
      }

      if (data && data.length > 0) {
      }

      const processedData = data.map((item) => ({
        ...item,
        id: item.id,
        content: item.content,
        recommended: item.recommended,
        solved: item.solved,
        createdAt: item.createdAt, // 명시적으로 createdAt 매핑
      }));

      setRows(processedData);
    } catch (error) {
      console.error("질문 목록을 불러오는데 실패했습니다:", error);
      showSnackbar("질문 목록을 불러오는데 실패했습니다.", "error");
    }
  }, [courseId, type]);

  const fetchAnswers = useCallback(
    async (questionId) => {
      try {
        const data = await getAnswersByQuestionIdApi(questionId);

        if (Array.isArray(data)) {
          const processedAnswers = data.map((serverAnswer) => {
            // 로컬에 저장된 답변 찾기
            const existingAnswer = answers.find(
              (a) => a.id === serverAnswer.id && a.questionId === questionId
            );

            // 새로 작성된 답변이면 기존 시간 유지
            if (existingAnswer?.isNewAnswer) {
              return {
                ...serverAnswer,
                createdAt: existingAnswer.createdAt,
                isNewAnswer: true,
              };
            }

            return serverAnswer;
          });

          setAnswers(processedAnswers);
        } else {
          setAnswers([]);
        }
      } catch (error) {
        console.error("답변 목록을 불러오는데 실패했습니다:", error);
        setAnswers([]);
      }
    },
    [answers]
  );

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (selectedRow?.id) {
      // 처음 drawer가 열릴 때만 답변 목록을 가져옴
      const isInitialFetch = !answers.some(
        (answer) => answer.questionId === selectedRow.id
      );

      if (isInitialFetch) {
        fetchAnswers(selectedRow.id);
      }
    }
  }, [selectedRow?.id]); // answers와 fetchAnswers 의존성 제거

  useEffect(() => {}, [userInfo]);

  useEffect(() => {
    const fetchCourseId = async () => {
      try {
        const memberType = userInfo?.member?.memberType;
        setType(memberType);

        if (!memberType) {
          return;
        }

        if (memberType === "ROLE_ADMIN") {
          const allQuestions = await getAllQuestions();
          setRows(allQuestions);
          return;
        }

        let fetchedCourseId;
        if (memberType === "ROLE_TEACHER") {
          fetchedCourseId = await getTeacherCourseId();
        } else if (memberType === "ROLE_STUDENT") {
          fetchedCourseId = await getStudentCourseId();
        }

        if (fetchedCourseId) {
          setCourseId(fetchedCourseId);
        }
      } catch (error) {
        console.error(
          "Error fetching course ID:",
          error.response?.data || error.message
        );
      }
    };

    fetchCourseId();
  }, [userInfo]);

  // 질문 관련 핸들러
  const handleQuestionSubmit = async () => {
    if (!content.trim()) {
      showSnackbar("질문 내용을 입력하세요.", "warning");
      return;
    }

    if (!userInfo?.member?.id || !courseId) {
      showSnackbar(
        "로그인 정보나 강의 정보가 필요합니다. 로그인 후 다시 시도하세요.",
        "error"
      );
      return;
    }

    try {
      const newQuestion = await saveQuestionApi({
        content,
        memberId: userInfo.member.id,
        courseId,
      });

      // 새 질문 데이터에 필요한 정보 추가
      const processedQuestion = {
        ...newQuestion,
        studentId: userInfo.member.id, // studentId 명시적 추가
        memberId: userInfo.member.id, // memberId 명시적 추가
      };

      // 새 질문을 목록에 추가
      setRows((prevRows) => [processedQuestion, ...prevRows]);

      showSnackbar("질문이 등록되었습니다.");
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showSnackbar("질문 등록에 실패했습니다.", "error");
    }
  };

  const handleQuestionUpdate = async () => {
    if (!content.trim()) {
      showSnackbar("질문 내용을 입력하세요.", "warning");
      return;
    }

    try {
      const updatedQuestion = await updateQuestionApi({
        id: selectedRow.id,
        content: content, // 현재 수정된 content 사용
      });

      // 성공 시 상태 업데이트
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === updatedQuestion.id
            ? { ...row, content: updatedQuestion.content }
            : row
        )
      );

      setSelectedRow((prev) => ({
        ...prev,
        content: updatedQuestion.content,
      }));

      showSnackbar("질문이 수정되었습니다.");
      setIsEditing(false);
      setContent(""); // content 초기화
    } catch (error) {
      console.error("질문 수정 실패:", error);
      showSnackbar("질문 수정에 실패했습니다.", "error");
    }
  };

  const handleQuestionDelete = async () => {
    const hasPermission = selectedIds.every((id) => {
      const question = rows.find((row) => row.id === id);
      if (!question) return false;

      return (
        type === "ROLE_ADMIN" ||
        type === "ROLE_TEACHER" ||
        (type === "ROLE_STUDENT" && question.studentId === userInfo?.member?.id)
      );
    });

    if (!hasPermission) {
      showSnackbar("삭제 권한이 없습니다.", "error");
      return;
    }

    try {
      await deleteQuestionsApi(selectedIds);
      showSnackbar("질문이 삭제되었습니다.");
      await fetchQuestions();
      setIsDeleteModalOpen(false);
      setOpenDrawer(false);
    } catch (error) {
      console.error("질문 삭제 실패:", error);
      showSnackbar("질문 삭제에 실패했습니다.", "error");
    }
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setSelectedRow(null);
    setIsEditing(false);
    resetForm();
  };

  // 답변 관련 핸들러
  const handleAnswerSubmit = async () => {
    if (!canManageAnswers()) {
      showSnackbar("답변 등록 권한이 없습니다.", "error");
      return;
    }

    if (!newAnswer.trim()) {
      showSnackbar("답변 내용을 입력하세요.", "warning");
      return;
    }

    if (!userInfo?.member?.id) {
      showSnackbar("사용자 정보가 없습니다. 로그인 해주세요.", "error");
      return;
    }

    try {
      const response = await saveAnswerApi({
        teacherId: userInfo.member.id,
        questionId: selectedRow.id,
        content: newAnswer,
      });

      const newAnswerObj = {
        ...response,
        id: response.id,
        content: newAnswer,
        teacherId: userInfo.member.id,
        teacherName: userInfo.member.name,
        createdAt: new Date().toISOString(),
        isNewAnswer: true, // 이 플래그 추가
        questionId: selectedRow.id, // 질문 ID도 추가
      };

      setAnswers((prevAnswers) => [newAnswerObj, ...prevAnswers]);
      setSelectedRow((prev) => ({ ...prev, solved: true }));
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === selectedRow.id ? { ...row, solved: true } : row
        )
      );

      showSnackbar("답변이 등록되었습니다.");
      setNewAnswer("");
    } catch (error) {
      showSnackbar("답변 등록에 실패했습니다.", "error");
      console.error("답변 등록 중 오류 발생:", error);
    }
  };

  // 답변 수정 핸들러
  const handleAnswerUpdate = async (answerId) => {
    if (!canManageAnswers()) {
      showSnackbar("답변 수정 권한이 없습니다.", "error");
      return;
    }

    if (!editedAnswerContent.trim()) {
      showSnackbar("답변 내용을 입력하세요.", "warning");
      return;
    }

    if (!editedAnswerContent.trim()) {
      showSnackbar("답변 내용을 입력하세요.", "warning");
      return;
    }

    try {
      await updateAnswerApi({
        id: answerId,
        content: editedAnswerContent,
      });
      showSnackbar("답변이 수정되었습니다.");
      await fetchAnswers(selectedRow.id);
      setEditingAnswerId(null); // 수정 모드 종료
      setEditedAnswerContent("");
    } catch (error) {
      showSnackbar("답변 수정에 실패했습니다.", "error");
    }
  };

  // 권한 확인 함수 수정
  const canDeleteAnswer = (answer) => {
    const memberType = userInfo?.member?.memberType;
    const userId = userInfo?.member?.id;

    // 관리자는 모든 답변 삭제 가능
    if (memberType === "ROLE_ADMIN") {
      return true;
    }

    // 강사는 자신의 답변만 삭제 가능
    if (memberType === "ROLE_TEACHER" && answer.teacherId === userId) {
      return true;
    }

    return false;
  };

  // handleAnswerDelete 함수 내 권한 체크 코드 수정
  const handleAnswerDelete = async (answerId) => {
    try {
      const answer = answers.find((a) => a.id === answerId);

      if (!answer) {
        console.error("No answer found with ID:", answerId);
        showSnackbar("답변을 찾을 수 없습니다.", "error");
        return;
      }

      // 권한 체크
      const hasPermission = canDeleteAnswer(answer);
      // console.log("Delete permission check:", {
      //   hasPermission,
      //   memberType: userInfo?.member?.memberType,
      //   userId: userInfo?.member?.id,
      //   teacherId: answer.teacherId,
      // });

      if (!hasPermission) {
        showSnackbar("삭제 권한이 없습니다.", "error");
        return;
      }

      // 답변 삭제 실행
      await deleteAnswerApi(answerId);

      // UI 업데이트: 답변 목록 가져오기
      const updatedAnswers = await getAnswersByQuestionIdApi(selectedRow.id);
      setAnswers(updatedAnswers); // 답변 목록 상태 업데이트

      // 답변이 없으면 solved 상태를 false로 업데이트
      if (!updatedAnswers || updatedAnswers.length === 0) {
        setSelectedRow((prev) => ({
          ...prev,
          solved: false,
        }));

        // DataGrid rows 업데이트
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === selectedRow.id ? { ...row, solved: false } : row
          )
        );
      }

      setSelectedAnswerId(null);
      handleMenuClose();
      showSnackbar("답변이 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting answer:", error);
      showSnackbar("답변 삭제에 실패했습니다.", "error");
    }
  };

  // 답변 수정 시작 핸들러 (수정 모드 활성화)
  const handleStartAnswerEdit = (answer) => {
    setEditingAnswerId(answer.id);
    setEditedAnswerContent(answer.content);
  };

  // 답변 수정 취소 핸들러
  const handleCancelAnswerEdit = () => {
    setEditingAnswerId(null);
    setEditedAnswerContent("");
  };

  const handleStartEdit = (questionContent) => {
    setIsEditing(true);
    setContent(questionContent);
  };

  // 권한 체크 유틸리티 함수들
  const canEditQuestion = (question) => {
    if (!question || !userInfo?.member) return false;

    const memberType = userInfo.member.memberType;
    const userId = userInfo.member.id;
    const questionUserId = question.studentId || question.memberId;

    // 관리자는 수정 권한 없음, 학생만 자신의 글 수정 가능
    return memberType === "ROLE_STUDENT" && questionUserId === userId;
  };

  const canManageRecommendation = () => {
    const memberType = userInfo?.member?.memberType;
    // 추천 기능은 교사만 가능하도록 수정
    return memberType === "ROLE_TEACHER";
  };

  const canDeleteQuestion = (question) => {
    const memberType = userInfo?.member?.memberType;
    const userId = userInfo?.member?.id;

    return (
      memberType === "ROLE_ADMIN" ||
      memberType === "ROLE_TEACHER" ||
      (memberType === "ROLE_STUDENT" && question.memberId === userId) // studentId 대신 memberId로 비교
    );
  };

  const canManageAnswers = () => {
    const memberType = userInfo?.member?.memberType;
    // 답변 작성은 교사만 가능하도록 수정
    return memberType === "ROLE_TEACHER";
  };

  const handleRecommendedClick = async (
    questionId,
    currentRecommendedStatus
  ) => {
    try {
      // 새로운 추천 상태를 미리 계산
      const newRecommendedStatus = !currentRecommendedStatus;

      const updatedQuestion = await toggleQuestionRecommendApi(
        questionId,
        currentRecommendedStatus
      );

      if (
        updatedQuestion &&
        typeof updatedQuestion.recommended !== "undefined"
      ) {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === questionId
              ? { ...row, recommended: updatedQuestion.recommended }
              : row
          )
        );

        setSelectedRow((prev) =>
          prev && prev.id === questionId
            ? { ...prev, recommended: updatedQuestion.recommended }
            : prev
        );

        // 새로운 상태(newRecommendedStatus)를 기준으로 메시지 결정
        showSnackbar(
          newRecommendedStatus ? "추천되었습니다." : "추천이 취소되었습니다.",
          "success"
        );
      } else {
        console.error("Invalid response from server:", updatedQuestion);
        showSnackbar("서버 응답이 올바르지 않습니다.", "error");
      }
    } catch (error) {
      console.error("추천 상태 변경 실패:", {
        error,
        questionId,
        response: error.response?.data,
      });
      showSnackbar(
        `추천 상태 변경에 실패했습니다. (${error.response?.status || "Unknown error"})`,
        "error"
      );
    }
  };

  const canShowMenu = (answer) => {
    const memberType = userInfo?.member?.memberType;
    const userId = userInfo?.member?.id;

    // 강사가 자신의 답변인 경우
    if (memberType === "ROLE_TEACHER" && answer.teacherId === userId) {
      return true;
    }

    // 관리자인 경우
    if (memberType === "ROLE_ADMIN") {
      return true;
    }

    return false;
  };

  // 메뉴 아이템 표시 여부 결정하는 함수 추가
  const getMenuItems = (answer) => {
    const memberType = userInfo?.member?.memberType;
    const userId = userInfo?.member?.id;

    // 강사가 자신의 답변인 경우
    if (memberType === "ROLE_TEACHER" && answer.teacherId === userId) {
      return ["edit", "delete"];
    }

    // 관리자는 삭제만
    if (memberType === "ROLE_ADMIN") {
      return ["delete"];
    }

    return [];
  };

  const handleMenuOpen = (event, answerId) => {
    setAnchorEl(event.currentTarget);
    setSelectedAnswerId(answerId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAnswerId(null);
  };

  // 수정, 삭제 핸들러 수정
  const handleMenuEdit = () => {
    handleStartAnswerEdit(answers.find((a) => a.id === selectedAnswerId));
    handleMenuClose();
  };

  const handleCloseDeleteModal = () => {
    setIsAnswerDeleteModalOpen(false);
    setDeleteTargetId(null);
  };

  const handleConfirmDelete = async () => {
    try {
      const answer = answers.find((a) => a.id === deleteTargetId);

      if (!answer) {
        console.error("No answer found with ID:", deleteTargetId);
        showSnackbar("답변을 찾을 수 없습니다.", "error");
        return;
      }

      // 권한 체크
      const hasPermission = canDeleteAnswer(answer);
      if (!hasPermission) {
        showSnackbar("삭제 권한이 없습니다.", "error");
        return;
      }

      // 강사가 이미 답변을 작성했는지 확인하는 함수

      // 답변 삭제 실행
      await deleteAnswerApi(deleteTargetId);

      // 새로운 답변 목록 가져오기
      const updatedAnswers = await getAnswersByQuestionIdApi(selectedRow.id);
      setAnswers(updatedAnswers);

      // 답변이 없으면 solved 상태를 false로 업데이트
      if (!updatedAnswers || updatedAnswers.length === 0) {
        // selectedRow 업데이트
        setSelectedRow((prev) => ({
          ...prev,
          solved: false,
        }));

        // DataGrid의 행도 업데이트
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === selectedRow.id ? { ...row, solved: false } : row
          )
        );
      }

      showSnackbar("답변이 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting answer:", error);
      showSnackbar("답변 삭제에 실패했습니다.", "error");
    } finally {
      handleCloseDeleteModal();
    }
  };

  const handleMenuDelete = (answerId) => {
    setDeleteTargetId(answerId);
    setIsAnswerDeleteModalOpen(true);
    handleMenuClose();
  };

  return (
    <>
      {/* 상단 버튼 영역 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          height: "40px",
          gap: "12px",
          marginBottom: 2,
        }}
      >
        {userInfo?.member?.memberType === "ROLE_STUDENT" && (
          <Button
            variant="outlined"
            sx={{ width: "38px", height: "38px" }}
            onClick={() => setIsModalOpen(true)}
          >
            <CreateIcon />
          </Button>
        )}
        <Button
          variant="outlined"
          sx={{ width: "38px", height: "38px" }}
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={selectedIds.length === 0}
        >
          <DeleteIcon />
        </Button>
      </Box>

      {/* 질문 작성 모달 */}
      <CustomModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
      >
        <Box
          sx={{
            display: "flex",
            margin: "auto",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <h3>질문 작성하기</h3>
          <TextField
            fullWidth
            label="질문 내용"
            variant="outlined"
            multiline
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ whiteSpace: "pre-wrap" }}
          />
          <Box
            sx={{
              display: "flex",
              gap: "24px",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              sx={{ width: "120px", height: "40px" }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleQuestionSubmit}
              sx={{
                width: "120px",
                height: "40px",
                backgroundColor: "#34495e",
              }}
            >
              등록하기
            </Button>
          </Box>
        </Box>
      </CustomModal>

      {/* 질문 삭제 모달 */}
      <CustomModal
        isOpen={isDeleteModalOpen}
        closeModal={() => setIsDeleteModalOpen(false)}
      >
        <Box
          sx={{
            display: "flex",
            margin: "auto",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <h3>질문 삭제하기</h3>
          <p>
            {selectedIds.length === 1
              ? "해당 질문을 삭제하시겠습니까?"
              : `${selectedIds.length}개의 질문을 삭제하시겠습니까?`}
          </p>
          <Box
            sx={{
              display: "flex",
              gap: "24px",
              margin: "16px 0",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setIsDeleteModalOpen(false)}
              sx={{ width: "120px", height: "40px" }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleQuestionDelete}
              sx={{
                width: "120px",
                height: "40px",
                backgroundColor: "#34495e",
              }}
            >
              삭제하기
            </Button>
          </Box>
        </Box>
      </CustomModal>

      {/* 답변 삭제 모달 */}
      <CustomModal
        isOpen={isAnswerDeleteModalOpen}
        closeModal={handleCloseDeleteModal}
      >
        <Box
          sx={{
            display: "flex",
            margin: "auto",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <h3>답변 삭제하기</h3>
          <p>답변을 삭제하시겠습니까?</p>
          <Box
            sx={{
              display: "flex",
              gap: "24px",
              margin: "16px 0",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCloseDeleteModal}
              sx={{ width: "120px", height: "40px" }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmDelete}
              sx={{
                width: "120px",
                height: "40px",
                backgroundColor: "#34495e",
              }}
            >
              삭제하기
            </Button>
          </Box>
        </Box>
      </CustomModal>

      {/* DataGrid */}
      <Box sx={{ height: 628, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          onRowClick={handleRowClick}
          onRowSelectionModelChange={setSelectedIds}
          getRowId={(row) => row.id}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
            sorting: {
              sortModel: [{ field: "createdAt", sort: "desc" }],
            },
          }}
          sortingOrder={["desc", "asc"]}
          localeText={{
            // 메뉴 관련
            columnMenuLabel: "메뉴",
            columnMenuShowColumns: "열 표시",
            columnMenuManageColumns: "열 관리",
            columnMenuFilter: "필터",
            columnMenuHideColumn: "숨기기",
            columnMenuUnsort: "정렬 해제",
            columnMenuSortAsc: "오름차순 정렬",
            columnMenuSortDesc: "내림차순 정렬",
            // 필터 관련
            filterOperatorContains: "포함",
            filterOperatorEquals: "같음",
            filterOperatorStartsWith: "시작값",
            filterOperatorEndsWith: "끝값",
            filterOperatorIs: "일치",
            filterOperatorNot: "제외",
            filterOperatorAfter: "이후",
            filterOperatorOnOrAfter: "이후(포함)",
            filterOperatorBefore: "이전",
            filterOperatorOnOrBefore: "이전(포함)",
            filterOperatorIsEmpty: "비어있음",
            filterOperatorIsNotEmpty: "비어있지 않음",
            filterOperatorIsAnyOf: "다음 중 하나",
            // 필터 패널
            filterPanelAddFilter: "필터 추가",
            filterPanelDeleteIconLabel: "삭제",
            filterPanelOperators: "연산자",
            filterPanelOperatorAnd: "그리고",
            filterPanelOperatorOr: "또는",
            filterPanelColumns: "열",
            filterPanelInputLabel: "값",
            filterPanelInputPlaceholder: "필터 값",
            // 기타
            columnsPanelTextFieldLabel: "열 찾기",
            columnsPanelTextFieldPlaceholder: "열 제목",
            columnsPanelDragIconLabel: "열 재정렬",
            columnsPanelShowAllButton: "모두 보기",
            columnsPanelHideAllButton: "모두 숨기기",
            // 선택 관련
            footerRowSelected: (count) => `${count}개 선택됨`,
            // 페이지네이션
            pagination: {
              labelRowsSelect: "행",
              labelDisplayedRows: ({ from, to, count }) =>
                `${count}개 중 ${from}-${to}`,
            },
            // 기본 메시지
            noRowsLabel: "데이터가 없습니다",
            noResultsOverlayLabel: "검색 결과가 없습니다.",
            errorOverlayDefaultLabel: "오류가 발생했습니다.",
          }}
          sx={{
            backgroundColor: "white",
            border: "none",
            "--DataGrid-rowBorderColor": "transparent",
            "& .MuiDataGrid-cell": {
              border: "none",
              paddingLeft: "18px", // 체크박스와 셀 데이터 간격 조정
            },
            "& .MuiDataGrid-row": {
              borderBottom: "1px solid #f6f8fa",
              paddingLeft: "1px", // 체크박스와 헤더 간격 조정
            },

            "& .MuiDataGrid-cellCheckbox": {
              // 체크박스 셀만 특정
              paddingLeft: "8px", // 체크박스 셀의 왼쪽 패딩을 0으로 설정
            },
            "& .MuiDataGrid-columnHeaders": {
              borderBottom: "1px solid #f6f8fa",
              paddingLeft: "2px", // 체크박스와 헤더 간격 조정
            },
            "& .MuiDataGrid-columnHeaderCheckbox": {
              // 헤더의 체크박스도 동일하게 조정
              paddingLeft: "0px",
            },

            "& .MuiDataGrid-footerContainer": {
              border: "none",
            },
            // 컬럼 메뉴 아이콘 스타일 추가
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              padding: "0 8px",
              justifyContent: "space-between",
            },
            // 정렬 아이콘 표시
            "& .MuiDataGrid-sortIcon": {
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2500}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={handleCloseDrawer}
        sx={{ zIndex: 1300 }}
      >
        <Box sx={{ width: 800, padding: 2 }}>
          {selectedRow ? (
            <Box sx={{ padding: "28px" }}>
              <Box
                sx={{
                  position: "relative", // 상대 위치로 설정
                  display: "flex",
                  marginBottom: "8px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      color: "gray",
                      fontSize: "12px",
                    }}
                  >
                    작성날짜:{" "}
                    {
                      new Date(selectedRow.createdAt)
                        .toISOString()
                        .split("T")[0]
                    }
                  </Typography>
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    cursor: canManageRecommendation() ? "pointer" : "default", // 권한에 따라 커서 스타일 변경
                  }}
                  onClick={() => {
                    if (!canManageRecommendation()) {
                      showSnackbar("추천 권한이 없습니다.", "warning");
                      return;
                    }
                    handleRecommendedClick(
                      selectedRow.id,
                      selectedRow.recommended
                    );
                  }}
                >
                  {selectedRow.recommended ? (
                    <FavoriteIcon
                      sx={{
                        color: canManageRecommendation()
                          ? "#ff4081"
                          : "#ff4081", // 권한 없으면 회색으로 표시
                        transition: "color 0.3s ease",
                        opacity: canManageRecommendation() ? 1 : 1, // 권한 없으면 투명도 낮게
                      }}
                    />
                  ) : (
                    <FavoriteBorderIcon
                      sx={{
                        color: canManageRecommendation() ? "gray" : "#ccc",
                        transition: "color 0.3s ease",
                        opacity: canManageRecommendation() ? 1 : 0.6,
                      }}
                    />
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  borderBottom: "1px solid #d4d4d4",
                  borderBottomWidth: "0.1px",
                  marginTop: "4px",
                  marginBottom: "60px",
                }}
              />

              <Box sx={{ flex: 1 }}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={content} // selectedRow.content 대신 content만 사용
                    onChange={(e) => setContent(e.target.value)}
                    multiline
                    sx={{ fontSize: "13px" }}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontSize: "15px",
                      whiteSpace: "pre-wrap",
                      marginBottom: "45px",
                    }}
                  >
                    {selectedRow.content}
                  </Typography>
                )}

                {/* 수정/삭제 버튼 부분 */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  {isEditing ? (
                    <>
                      <Button variant="outlined" onClick={handleQuestionUpdate}>
                        저장
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setIsEditing(false);
                          setContent("");
                        }}
                      >
                        취소
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* 수정 버튼 - 본인 글인 학생만 가능 */}
                      {type === "ROLE_STUDENT" &&
                        selectedRow?.studentId === userInfo?.member?.id && (
                          <Button
                            variant="outlined"
                            onClick={() => handleStartEdit(selectedRow.content)}
                          >
                            수정
                          </Button>
                        )}
                      {/* 삭제 버튼 - 관리자, 교사, 본인인 경우 */}
                      {(type === "ROLE_ADMIN" ||
                        type === "ROLE_TEACHER" ||
                        (type === "ROLE_STUDENT" &&
                          selectedRow?.studentId === userInfo?.member?.id)) && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setSelectedIds([selectedRow.id]);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          삭제
                        </Button>
                      )}
                    </>
                  )}
                </Box>
                {/* 구분선 - 항상 같은 위치에 표시 */}
                <Box
                  sx={{
                    borderBottom: "1px solid #d4d4d4",
                    width: "100%",
                  }}
                />
              </Box>

              {/* 답변 작성 */}

              <Typography
                variant="h6"
                sx={{ marginBottom: 1, marginTop: "30px", fontStyle: "bold" }}
              >
                답변 {answers.length}개
              </Typography>
              {type === "ROLE_TEACHER" && ( // 관리자 제외, 교사만 답변 작성 가능
                <>
                  {!hasTeacherAlreadyAnswered() ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "40px",
                        gap: 1,
                      }}
                    >
                      <TextField
                        fullWidth
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        placeholder="답변을 입력하세요"
                        multiline
                        minRows={1}
                        sx={{
                          maxWidth: "90%",
                          "& .MuiInputBase-root": {
                            padding: "8px",
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAnswerSubmit}
                        sx={{
                          backgroundColor: "#34495e",
                          height: "auto",
                          padding: "8px 16px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        등록
                      </Button>
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        color: "text.secondary",
                        marginBottom: "20px",
                        fontSize: "0.875rem",
                      }}
                    ></Typography>
                  )}
                </>
              )}

              {/* 답변 리스트 */}
              <Box
                sx={{
                  marginTop: "10px",
                  paddingLeft: "3px",
                }}
              >
                {answers.map((answer, index) => {
                  return (
                    <Box
                      key={answer.id || index} // answer.id가 없으면 index를 사용
                    >
                      {editingAnswerId === answer.id ? (
                        <>
                          <TextField
                            fullWidth
                            value={editedAnswerContent}
                            onChange={(e) =>
                              setEditedAnswerContent(e.target.value)
                            }
                            multiline
                            minRows={2}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              mt: 1,
                              justifyContent: "flex-end",
                            }}
                          >
                            <Button
                              variant="outlined"
                              onClick={() => handleAnswerUpdate(answer.id)}
                            >
                              저장
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={handleCancelAnswerEdit}
                            >
                              취소
                            </Button>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography
                              sx={{ fontSize: "14px", fontWeight: "bold" }}
                            >
                              {answer.teacherName || "이름 없음"}
                            </Typography>

                            {/* 상대 시간 표시 */}
                            <Typography
                              sx={{
                                fontSize: "12px",
                                color: "gray",
                                transform: canShowMenu(answer)
                                  ? "translateX(-255px)"
                                  : "translateX(-584px)",
                                minWidth: "80px",
                                textAlign: "left",
                              }}
                            >
                              {formatDistanceToNow(new Date(answer.createdAt), {
                                addSuffix: true,
                                locale: ko,
                                includeSeconds: true,
                                // 현재 시간을 한국 시간으로 설정
                                baseDate: new Date(
                                  new Date().toLocaleString("en-US", {
                                    timeZone: "Asia/Seoul",
                                  })
                                ),
                              })}
                            </Typography>

                            {canShowMenu(answer) && (
                              <Box>
                                <Button
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, answer.id)}
                                >
                                  <MoreVertIcon
                                    fontSize="medium"
                                    sx={{
                                      color: "gray",
                                      bottom: "14px",
                                    }}
                                  />
                                </Button>
                                <Menu
                                  anchorEl={anchorEl}
                                  open={
                                    Boolean(anchorEl) &&
                                    selectedAnswerId === answer.id
                                  }
                                  onClose={handleMenuClose}
                                >
                                  {getMenuItems(answer).includes("edit") && (
                                    <MenuItem onClick={handleMenuEdit}>
                                      <EditIcon
                                        fontSize="small"
                                        sx={{ mr: 1 }}
                                      />
                                      수정
                                    </MenuItem>
                                  )}
                                  {getMenuItems(answer).includes("delete") && (
                                    <MenuItem
                                      onClick={() => {
                                        handleMenuDelete(answer.id);
                                      }}
                                    >
                                      <DeleteIcon
                                        fontSize="small"
                                        sx={{ mr: 1 }}
                                      />
                                      삭제
                                    </MenuItem>
                                  )}
                                </Menu>
                              </Box>
                            )}
                          </Box>

                          <Typography
                            sx={{
                              fontSize: "14px",
                              whiteSpace: "pre-wrap",
                              position: "relative",
                              bottom: "10px",
                            }}
                          >
                            {answer.content}
                          </Typography>
                        </>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : (
            <Typography>선택된 질문이 없습니다.</Typography>
          )}
        </Box>
      </Drawer>
    </>
  );
}
