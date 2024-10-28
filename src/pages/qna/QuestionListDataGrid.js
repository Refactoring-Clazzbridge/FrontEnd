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
// 중복된 import를 제거하고, 하나의 올바른 경로로 수정
import { saveQuestionApi } from "../../services/apis/question/post";
import { deleteQuestionsApi } from "../../services/apis/question/delete";
import { getQuestionsByCourseId } from "../../services/apis/question/get";
import { updateQuestionApi } from "../../services/apis/question/put";
import { UserContext } from "../../context/UserContext";
import { getAnswersByQuestionIdApi } from "../../services/apis/answer/get";
import { saveAnswerApi } from "../../services/apis/answer/post";
import { updateAnswerApi } from "../../services/apis/answer/put";
import { deleteAnswerApi } from "../../services/apis/answer/delete";
import { getTeacherCourseId } from "../../services/apis/course/teacherCourseGet";
import { getStudentCourseId } from "../../services/apis/course/studentCourseGet";
import { getAllQuestions } from "../../services/apis/question/get";

const columns = [
  { field: "id", headerName: "No", flex: 0.5, resizable: false },
  {
    field: "content",
    flex: 4,
    headerName: "질문",
    resizable: false,
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
  },
  {
    field: "solved",
    headerName: "해결 여부",
    flex: 1,
    resizable: false,
  },
  {
    field: "createdAt",
    flex: 1,
    headerName: "작성날짜",
    resizable: false,
    valueFormatter: (params) => {
      const date = new Date(params.value);
      return date.toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
  },
];

export default function QuestionBoard() {
  // 상태 관리
  const { userInfo } = useContext(UserContext);
  const [rows, setRows] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editedAnswerContent, setEditedAnswerContent] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [courseId, setCourseId] = useState(null); // 강의 ID 상태 추가
  const [type, setType] = useState(null);

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
      console.log("Course ID가 설정되지 않았습니다:", courseId);
      return;
    }

    try {
      let data;
      if (type === "ROLE_ADMIN") {
        data = await getAllQuestions();
      } else {
        console.log("질문을 가져오는 중... courseId:", courseId);
        data = await getQuestionsByCourseId(courseId);
      }
      console.log("가져온 질문 데이터:", data);
      setRows(data);
    } catch (error) {
      console.error("질문 목록을 불러오는데 실패했습니다:", error);
      showSnackbar("질문 목록을 불러오는데 실패했습니다.", "error");
    }
  }, [courseId, type]);

  const fetchAnswers = useCallback(async (questionId) => {
    try {
      const data = await getAnswersByQuestionIdApi(questionId);
      console.log("Fetched answers data:", data); // 서버로부터 받아온 데이터를 확인

      // 응답이 문자열일 경우 배열로 변환
      if (typeof data === "string") {
        setAnswers([data]); // 문자열을 배열로 감쌈
      } else if (Array.isArray(data)) {
        setAnswers(data); // 이미 배열이면 그대로 설정
      } else {
        setAnswers([]); // 다른 타입의 응답일 경우 빈 배열로 처리
      }
    } catch (error) {
      console.error("답변 목록을 불러오는데 실패했습니다:", error);
      setAnswers([]); // 오류 발생 시 빈 배열로 처리
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (selectedRow?.id) {
      fetchAnswers(selectedRow.id);
    }
  }, [selectedRow, fetchAnswers]);

  useEffect(() => {
    console.log("Fetched answers:", answers); // answers 배열이 업데이트될 때마다 출력
  }, [answers]); // answers가 변경될 때마다 실행

  useEffect(() => {
    console.log("User Info:", userInfo);
  }, [userInfo]);

  useEffect(() => {
    const fetchCourseId = async () => {
      try {
        console.log("전체 userInfo:", userInfo);
        const memberType = userInfo?.member?.memberType;
        setType(memberType);

        if (!memberType) {
          console.log("memberType이 아직 설정되지 않음");
          return;
        }

        // 관리자인 경우 모든 질문을 가져옴
        if (memberType === "ROLE_ADMIN") {
          const allQuestions = await getAllQuestions();
          setRows(allQuestions);
          return;
        }

        // 교사/학생인 경우 기존 로직 유지
        let fetchedCourseId;
        if (memberType === "ROLE_TEACHER") {
          fetchedCourseId = await getTeacherCourseId();
        } else if (memberType === "ROLE_STUDENT") {
          fetchedCourseId = await getStudentCourseId();
        }

        console.log("가져온 courseId:", fetchedCourseId);
        if (fetchedCourseId) {
          setCourseId(fetchedCourseId);
          console.log("설정된 courseId:", fetchedCourseId);
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
      await saveQuestionApi({
        content,
        memberId: userInfo.member.id,
        courseId, // 강의 ID 포함
      });
      showSnackbar("질문이 등록되었습니다.");
      await fetchQuestions();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showSnackbar("질문 등록에 실패했습니다.", "error");
    }
  };

  const handleQuestionUpdate = async () => {
    if (!canEditQuestion(selectedRow)) {
      showSnackbar("수정 권한이 없습니다.", "error");
      return;
    }
    try {
      const updatedQuestion = await updateQuestionApi({
        id: selectedRow.id,
        content: content || selectedRow.content,
      });
      showSnackbar("질문이 수정되었습니다.");

      // 질문 목록을 업데이트하여 화면에 즉시 반영
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === updatedQuestion.id
            ? { ...row, content: updatedQuestion.content }
            : row
        )
      );

      setIsEditing(false);
      resetForm();
    } catch (error) {
      showSnackbar("질문 수정에 실패했습니다.", "error");
    }
  };

  const handleQuestionDelete = async () => {
    // selectedIds에 있는 모든 질문에 대해 권한 체크
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
      showSnackbar("질문 삭제에 실패했습니다.", "error");
    }
  };

  // 이벤트 핸들러
  const handleRowClick = (params) => {
    setSelectedRow(params.row);
    setOpenDrawer(true);
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
      // userInfo.member.id가 없을 때 경고 메시지
      showSnackbar("사용자 정보가 없습니다. 로그인 해주세요.", "error");
      return;
    }

    console.log("userInfo.member.id (memberId):", userInfo.member.id);
    console.log("questionId:", selectedRow?.id);
    console.log("newAnswer:", newAnswer);

    if (!newAnswer.trim()) {
      showSnackbar("답변 내용을 입력하세요.", "warning");
      return;
    }

    if (!selectedRow?.id) {
      showSnackbar("질문을 선택해주세요.", "error");
      return;
    }

    try {
      const response = await saveAnswerApi({
        teacherId: userInfo.member.id, // userInfo.member.id를 교사 ID로 사용
        questionId: selectedRow.id, // 선택한 질문의 ID
        content: newAnswer, // 답변 내용
      });
      console.log("서버 응답:", response);
      showSnackbar("답변이 등록되었습니다.");
      await fetchAnswers(selectedRow.id); // 답변 목록 갱신
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

  // 답변 삭제 핸들러
  const handleAnswerDelete = async (answerId) => {
    if (!canManageAnswers()) {
      showSnackbar("답변 삭제 권한이 없습니다.", "error");
      return;
    }
    try {
      await deleteAnswerApi(answerId);
      showSnackbar("답변이 삭제되었습니다.");
      await fetchAnswers(selectedRow.id);
    } catch (error) {
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

  // 권한 체크 유틸리티 함수들
  const canEditQuestion = (question) => {
    const memberType = userInfo?.member?.memberType;
    const userId = userInfo?.member?.id;

    console.log("Current user:", userId);
    console.log("Question student:", question.studentId);
    console.log("User type:", memberType);

    return (
      memberType === "ROLE_ADMIN" || // 관리자는 모든 질문 수정 가능
      (memberType === "ROLE_STUDENT" && question.studentId === userId) // 학생은 자신의 질문만 수정 가능
    );
  };

  const canDeleteQuestion = (question) => {
    const memberType = userInfo?.member?.memberType;
    const userId = userInfo?.member?.id;

    return (
      memberType === "ROLE_ADMIN" || // 관리자는 모든 질문 삭제 가능
      memberType === "ROLE_TEACHER" || // 강사는 모든 질문 삭제 가능
      (memberType === "ROLE_STUDENT" && question.studentId === userId) // 학생은 자신의 질문만 삭제 가능
    );
  };

  const canManageAnswers = () => {
    const memberType = userInfo?.member?.memberType;
    return ["ROLE_ADMIN", "ROLE_TEACHER"].includes(memberType); // 관리자와 강사 모두 답변 관리 가능
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
        <Button
          variant="outlined"
          sx={{ width: "38px", height: "38px" }}
          onClick={() => setIsModalOpen(true)}
        >
          <CreateIcon />
        </Button>
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

      {/* DataGrid */}
      <Box sx={{ height: 628, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          onRowClick={handleRowClick}
          onRowSelectionModelChange={setSelectedIds}
          sx={{
            backgroundColor: "white",
            border: "none",
            "--DataGrid-rowBorderColor": "transparent",
            "& .MuiDataGrid-cell": {
              border: "none",
            },
            "& .MuiDataGrid-row": {
              borderBottom: "1px solid #f6f8fa",
            },
            "& .MuiDataGrid-columnHeaders": {
              borderBottom: "1px solid #f6f8fa",
            },
            "& .MuiDataGrid-footerContainer": {
              border: "none",
            },
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5]}
          localeText={{
            footerRowSelected: (count) => `${count}개 선택됨`,
            noRowsLabel: "데이터가 없습니다.",
            noResultsOverlayLabel: "결과가 없습니다.",
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
              <Typography
                sx={{
                  color: "gray",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {selectedRow.solved ? "해결됨" : "미해결"}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: "4px",
                }}
              >
                <Box
                  sx={{ color: "gray", marginLeft: "600px", width: "116px" }}
                >
                  <Typography sx={{ fontSize: "12px" }}>
                    작성날짜: {selectedRow.createdAt}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  borderBottom: "1px solid #d4d4d4",
                  borderBottomWidth: "0.1px",
                  marginY: "30px",
                }}
              />

              <Box sx={{ flex: 1 }}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={content || selectedRow.content}
                    onChange={(e) => setContent(e.target.value)}
                    multiline
                    sx={{ fontSize: "13px" }}
                  />
                ) : (
                  <Typography sx={{ fontSize: "15px", whiteSpace: "pre-wrap" }}>
                    {selectedRow.content}
                  </Typography>
                )}
              </Box>

              {/* 질문 수정/삭제 버튼 */}
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
                      onClick={() => setIsEditing(false)}
                    >
                      취소
                    </Button>
                  </>
                ) : (
                  <>
                    {canEditQuestion(selectedRow) && (
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(true)}
                      >
                        수정
                      </Button>
                    )}
                    {canDeleteQuestion(selectedRow) && (
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

              {/* 답변 리스트 */}
              <Box sx={{ marginTop: "40px" }}>
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                  답변 목록 ({answers.length})
                </Typography>
                {answers.map((answer, index) => {
                  console.log("Answer object:", answer); // answer 객체 확인
                  return (
                    <Box
                      key={answer.id || index} // answer.id가 없으면 index를 사용
                      sx={{
                        borderBottom: "1px solid #f0f0f0",
                        py: 2,
                      }}
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

                            {canManageAnswers() && (
                              <>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Button
                                    size="small"
                                    onClick={() =>
                                      handleStartAnswerEdit(answer)
                                    }
                                  >
                                    <EditIcon fontSize="small" />
                                  </Button>
                                  <Button
                                    size="small"
                                    onClick={() =>
                                      handleAnswerDelete(answer.id)
                                    }
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </Button>
                                </Box>
                              </>
                            )}
                          </Box>

                          <Typography
                            sx={{ fontSize: "14px", whiteSpace: "pre-wrap" }}
                          >
                            {answer.content}
                          </Typography>
                        </>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* 답변 작성 */}
              {(type === "ROLE_ADMIN" || type === "ROLE_TEACHER") && (
                <Box sx={{ marginTop: "40px" }}>
                  <Typography variant="h6" sx={{ marginBottom: 2 }}>
                    답변 작성
                  </Typography>
                  <TextField
                    fullWidth
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="답변을 입력하세요"
                    multiline
                    minRows={3}
                  />
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleAnswerSubmit}
                      sx={{ backgroundColor: "#34495e" }}
                    >
                      답변 등록
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Typography>선택된 질문이 없습니다.</Typography>
          )}
        </Box>
      </Drawer>
    </>
  );
}
