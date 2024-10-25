import React, { useEffect, useState, useCallback } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import CustomModal from "../../components/common/CustomModal";
// 중복된 import를 제거하고, 하나의 올바른 경로로 수정
import { saveQuestionApi } from "../../services/apis/question/post";
import { deleteQuestionsApi } from "../../services/apis/question/delete";
import { getAllQuestions } from "../../services/apis/question/get";
import { updateQuestionApi } from "../../services/apis/question/put";

import { getAnswersByQuestionIdApi } from "../../services/apis/answer/get";
import { saveAnswerApi } from "../../services/apis/answer/post";
import { updateAnswerApi } from "../../services/apis/answer/put";
import { deleteAnswerApi } from "../../services/apis/answer/delete";
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
  },
];

export default function QuestionBoard() {
  // 상태 관리
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

  // 초기 데이터 로딩
  const fetchQuestions = useCallback(async () => {
    try {
      const data = await getAllQuestions();
      setRows(data);
    } catch (error) {
      showSnackbar("질문 목록을 불러오는데 실패했습니다.", "error");
    }
  }, []);

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

  // 질문 관련 핸들러
  const handleQuestionSubmit = async () => {
    if (!content.trim()) {
      showSnackbar("질문 내용을 입력하세요.", "warning");
      return;
    }

    try {
      await saveQuestionApi({ content });
      showSnackbar("질문이 등록되었습니다.");
      await fetchQuestions();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showSnackbar("질문 등록에 실패했습니다.", "error");
    }
  };

  const handleQuestionUpdate = async () => {
    try {
      await updateQuestionApi({
        id: selectedRow.id,
        content: content || selectedRow.content,
      });
      showSnackbar("질문이 수정되었습니다.");
      await fetchQuestions();
      setIsEditing(false);
      resetForm();
    } catch (error) {
      showSnackbar("질문 수정에 실패했습니다.", "error");
    }
  };

  const handleQuestionDelete = async () => {
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
    const memberId = localStorage.getItem("memberId");

    console.log("memberId:", memberId);
    console.log("questionId:", selectedRow.id);
    console.log("newAnswer:", newAnswer);

    if (!newAnswer.trim()) {
      showSnackbar("답변 내용을 입력하세요.", "warning");
      return;
    }

    if (!memberId || !selectedRow?.id) {
      showSnackbar("필수 값이 누락되었습니다.", "error");
      return;
    }

    try {
      const response = await saveAnswerApi({
        teacherId: memberId, // 교사 ID
        questionId: selectedRow.id, // 질문 ID
        content: newAnswer, // 답변 내용
      });
      console.log("서버 응답:", response);
      showSnackbar("답변이 등록되었습니다.");
      await fetchAnswers(selectedRow.id);
      setNewAnswer("");
    } catch (error) {
      showSnackbar("답변 등록에 실패했습니다.", "error");
      console.error("답변 등록 중 오류 발생:", error);
    }
  };

  const handleAnswerUpdate = async (answerId) => {
    try {
      if (!editedAnswerContent.trim()) {
        showSnackbar("답변 내용을 입력하세요.", "warning");
        return;
      }

      await updateAnswerApi({
        questionId: selectedRow.id,
        teacherAnswer: newAnswer,
      });
      showSnackbar("답변이 수정되었습니다.");

      // 새로 수정된 내용을 반영하기 위해 답변 목록 다시 불러오기
      await fetchAnswers(selectedRow.id);

      // 수정 후 상태 초기화
      setEditingAnswerId(null);
      setEditedAnswerContent("");
    } catch (error) {
      showSnackbar("답변 수정에 실패했습니다.", "error");
    }
  };

  const handleAnswerDelete = async (answerId) => {
    try {
      await deleteAnswerApi(answerId);
      showSnackbar("답변이 삭제되었습니다.");
      await fetchAnswers(selectedRow.id);
    } catch (error) {
      showSnackbar("답변 삭제에 실패했습니다.", "error");
    }
  };

  const handleStartAnswerEdit = (answer) => {
    setEditingAnswerId(answer.id);
    setEditedAnswerContent(answer.content);
  };

  const handleCancelAnswerEdit = () => {
    setEditingAnswerId(null);
    setEditedAnswerContent("");
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
                  <Typography sx={{ fontSize: "15px" }}>
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
                    <Button
                      variant="outlined"
                      onClick={() => setIsEditing(true)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedIds([selectedRow.id]);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      삭제
                    </Button>
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
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Button
                                size="small"
                                onClick={() => handleStartAnswerEdit(answer)}
                              >
                                <EditIcon fontSize="small" />
                              </Button>
                              <Button
                                size="small"
                                onClick={() => handleAnswerDelete(answer.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </Button>
                            </Box>
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
            </Box>
          ) : (
            <Typography>선택된 질문이 없습니다.</Typography>
          )}
        </Box>
      </Drawer>
    </>
  );
}
