import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Typography,
  TextField,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import moment from "moment";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import apiClient from "../../shared/apiClient";
import { DataGrid } from "@mui/x-data-grid"; // DataGrid 임포트
import { v4 as uuidv4 } from "uuid"; // 고유한 ID를 생성하기 위해 uuid 패키지 사용
import CustomSnackbar from "../../components/common/CustomSnackbar"; // 커스텀 스낵바
import CustomModal from "../../components/common/CustomModal"; // 커스텀 모달

import PollIcon from "@mui/icons-material/Poll";
import "../../styles/vote.css";

const Vote = () => {
  const [openModal, setOpenModal] = useState(false);
  const [open, setOpen] = useState("");
  const [selectedVotes, setSelectedVotes] = useState([]); // 선택한 투표(전체) 상태 관리

  // 폼 입력 상태 관리
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventStart, setNewEventStart] = useState(moment());
  const [newEventEnd, setNewEventEnd] = useState(moment().add(1, "hour"));
  const [newEventOptionText, setNewEventOptionText] = useState([""]); // 초기값으로 빈 문자열을 가진 배열

  const [events, setEvents] = useState("");
  const [courseOption, setCourseOption] = useState("");

  const [openModalVoteInfo, setOpenModalVoteInfo] = useState(false); // Modal 열기/닫기 상태
  const [selectedVote, setSelectedVote] = useState(null); // 선택된 투표
  const [voteInfo, setVoteInfo] = useState(null); // Fetch된 투표 상세 정보 상태 관리
  const [selectedOption, setSelectedOption] = useState(null); // 첫 번째 옵션의 ID로 초기화

  const [dateError, setDateError] = useState("");

  const [openSnackbar, setOpenSnackbar] = useState(false); // 스낵바 열기 상태
  const [snackbarMessage, setSnackbarMessage] = useState(""); // 스낵바 메시지
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 스낵바 성공/실패 유무
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // 스낵바 닫기
  };
  const role = localStorage.getItem("membertype");

  const renderButtons = () => {
    if (role === "ROLE_TEACHER") {
      return (
        <>
          <Button
            variant="outlined"
            onClick={handleOpen}
            style={{ marginRight: "6px" }}
          >
            투표 등록
          </Button>
          <div>
            <Button
              variant="outlined"
              onClick={deleteSelectedVote}
              sx={{ mr: 2 }}
            >
              투표 삭제
            </Button>

            {/* Custom Modal */}
            <CustomModal
              isOpen={openModal}
              closeModal={() => setOpenModal(false)}
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
                <h3>투표 삭제</h3>
                <p>선택된 투표 {selectedVotes.length}개를 삭제하시겠습니까?</p>
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: "24px",
                    margin: "16px 0",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setOpenModal(false)}
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
                    onClick={handleDeleteConfirmation}
                    sx={{
                      width: "120px",
                      height: "40px",
                      backgroundColor: "#34495e",
                      fontWeight: 600,
                    }}
                  >
                    삭제
                  </Button>
                </Box>
              </Box>
            </CustomModal>
          </div>
        </>
      );
    } else if (role === "ROLE_ADMIN") {
      return (
        <div>
          <Button
            variant="outlined"
            onClick={deleteSelectedVote}
            sx={{ mr: 2 }}
          >
            투표 삭제
          </Button>

          {/* Custom Modal */}
          <CustomModal
            isOpen={openModal}
            closeModal={() => setOpenModal(false)}
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
              <h3>투표 삭제</h3>
              <p>선택된 투표 {selectedVotes.length}개를 삭제하시겠습니까?</p>
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: "24px",
                  margin: "16px 0",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setOpenModal(false)}
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
                  onClick={handleDeleteConfirmation}
                  sx={{
                    width: "120px",
                    height: "40px",
                    backgroundColor: "#34495e",
                    fontWeight: 600,
                  }}
                >
                  삭제
                </Button>
              </Box>
            </Box>
          </CustomModal>
        </div>
      );
    }
    // ROLE_STUDENT는 아무 버튼도 표시되지 않음
    return null;
  };

  useEffect(() => {
    fetchEvents();
    fetchCourse();
    if (selectedVote) {
      fetchVoteInfo(selectedVote.id);
    }
  }, [selectedVote]); // 2번째 인수에 빈 배열을 줘서 한 번만 실행

  const fetchEvents = () => {
    apiClient
      .get("vote")
      .then((response) => {
        const fetchedEvents = response.data.map((event) => ({
          ...event,
          isExpired: event.isExpired ? "투표 마감" : "투표 중", // 표시용 변환
        }));
        setEvents(fetchedEvents); // 상태 업데이트
      })
      .catch((error) => {
        console.error("이벤트 데이터를 불러오지 못했습니다.", error);
      });
  };

  const fetchCourse = () => {
    // 강의명 목록을 가져오는 API 호출
    apiClient
      .get("course/title")
      .then((response) => {
        setCourseOption(response.data); // 강의명 목록 설정
      })
      .catch((error) => {
        console.error("강의명 목록을 불러오지 못했습니다.", error);
      });
  };

  const handleRowClick = (params) => {
    setSelectedVote(params.row); // 선택된 투표 저장
    fetchVoteInfo(params.row.id); // 선택된 투표의 ID를 사용하여 투표 상세 정보 가져오기
    setOpenModalVoteInfo(true); // Drawer 열기
  };

  // 투표 제출
  const handleVoteSubmit = () => {
    if (selectedOption) {
      // 서버로 선택된 옵션을 전송
      apiClient
        .put(`vote/${selectedVote.id}/submit`, {
          voteId: selectedVote.id,
          voteOptionId: selectedOption,
        })
        .then(() => {
          setSnackbarMessage("투표가 성공적으로 제출되었습니다.");
          setSnackbarSeverity("success");
          setOpenSnackbar(true);
          setOpenModalVoteInfo(false);
          console.log(selectedOption.voteId);
        })
        .catch((error) => {
          console.error("투표 제출 실패:", error);
          setSnackbarMessage(error.response.data);
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
        });
    } else {
      setSnackbarMessage("옵션을 선택하세요.");
      setSnackbarSeverity("warning");
      setOpenSnackbar(true);
    }
  };

  const fetchVoteInfo = (id) => {
    apiClient
      .get(`vote/detail/${id}`)
      .then((response) => {
        console.log("API Response:", response.data);
        setVoteInfo(response.data);
        setSelectedOption("");
      })
      .catch((error) => {
        console.error("투표 상세 정보를 불러오지 못했습니다.", error);
      });
  };

  // 폼 초기화
  const resetForm = () => {
    setNewEventTitle("");
    setNewEventDescription("");
    setNewEventStart(moment());
    setNewEventEnd(moment().add(30, "minute"));
    setNewEventOptionText([""]);
  };

  // 모달 열기 및 닫기
  const handleOpen = () => {
    resetForm();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // 옵션 추가 함수
  const handleAddOptionText = () => {
    setNewEventOptionText([...newEventOptionText, ""]); // 새 옵션 추가
  };

  // 옵션 삭제 함수
  const handleDeleteOptionText = (index) => {
    const updatedOptionText = newEventOptionText.filter((_, i) => i !== index); // 특정 인덱스 삭제
    setNewEventOptionText(updatedOptionText);
  };

  // 신규 투표 추가
  const addVote = (newVote) => {
    apiClient
      .post("vote", newVote) // ID 없이 투표 추가
      .then((response) => {
        const addedVote = {
          ...response.data,
          id: response.data.id || uuidv4(), // 서버가 `id`를 주지 않으면 클라이언트에서 임시로 생성
        };
        setEvents([...events, addedVote]); // 응답으로 받은 새 투표 추가
        setSnackbarMessage("투표가 추가되었습니다.");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        handleClose();
        fetchEvents(); // 추가 후 이벤트 목록 새로 고침
      })
      .catch((error) => {
        console.log(newVote);
        console.error("투표 추가에 실패했습니다.", error);
      });
  };

  const handleSaveEvent = () => {
    const newVote = {
      title: newEventTitle,
      description: newEventDescription,
      startDate: newEventStart.format("YYYY-MM-DDTHH:mm"),
      endDate: newEventEnd.format("YYYY-MM-DDTHH:mm"),
      optionText: newEventOptionText,
    };

    // 날짜 에러 메시지 띄우기
    if (newEventStart.isAfter(newEventEnd)) {
      setDateError("종료 날짜는 시작 날짜 이후여야 합니다.");
      return;
    }

    setDateError("");

    addVote(newVote);
  };

  const handleDeleteConfirmation = () => {
    const deletePromises = selectedVotes.map((id) => {
      console.log("Delete vote with ID:", id); // 삭제할 voteId 확인
      return apiClient.delete(`vote/${id}`);
    });

    Promise.all(deletePromises)
      .then(() => {
        const updatedEvents = events.filter(
          (event) => !selectedVotes.includes(event.id)
        );
        setEvents(updatedEvents);
        setSelectedVotes([]); // 선택한 투표 초기화
        setSnackbarMessage(`${selectedVotes.length}개 투표를 삭제했습니다.`);
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      })
      .catch((error) => {
        console.error("투표 정보를 삭제하지 못했습니다", error.response.data);
        setSnackbarMessage("강의 삭제 실패: ", error.response.data.message);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      });

    setOpenModal(false); // 모달 닫기
  };

  const deleteSelectedVote = () => {
    if (selectedVotes.length === 0) {
      setSnackbarMessage("삭제할 투표를 선택하세요.");
      setSnackbarSeverity("error"); // 실패 스낵바
      setOpenSnackbar(true);
      return;
    }
    setOpenModal(true); // 모달 열기
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      {/* 커스텀 스낵바 */}
      <CustomSnackbar
        open={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleCloseSnackbar}
      />
      <div>
        {/* 투표 리스트 테이블 */}
        <Box sx={{ height: 650, width: "100%" }}>
          <DataGrid
            sx={{
              backgroundColor: "white", // 배경색
              border: "none", // 테두리
              "--DataGrid-rowBorderColor": "transparent",
              "& .MuiDataGrid-cell": {
                border: "none",
              },
              "& .MuiDataGrid-row": {
                borderBottom: "1px solid #f6f8fa",
              },
              "& .MuiDataGrid-filler": {
                display: "none",
              },
              "& .MuiDataGrid-footerContainer": {
                border: "none",
              },
              "& .MuiDataGrid-columnHeaderTitleContainer": {
                fontSize: "12px",
                fontWeight: "bold",
                color: "#222831",
              },
              "& .MuiDataGrid-columnSeparator--sideRight": {
                display: "none",
              },
              "& .MuiDataGrid-columnHeader": {
                color: "black", // 헤더 글자색
                border: "none",
              },
            }}
            localeText={{
              // 선택된 행 수 텍스트 변경
              footerRowSelected: (count) => `${count}개 선택됨`, // 예: "11개 선택됨"
              // 필터 관련 텍스트 변경
              filterOperatorContains: "포함",
              filterOperatorEquals: "같음",
              filterOperatorStartsWith: "시작함",
              filterOperatorEndsWith: "끝남",
              filterOperatorIs: "이것",
              filterOperatorDoesNotContain: "포함하지 않음",
              filterOperatorDoesNotEqual: "같지 않음",
              filterOperatorIsAnyOf: "다음 중 하나",
              filterOperatorNot: "아니오",
              filterOperatorAfter: "이후",
              filterOperatorBefore: "이전",
              filterOperatorIsEmpty: "비어 있음",
              filterOperatorIsNotEmpty: "비어 있지 않음",

              // 필터 메뉴 텍스트
              filterPanelInputLabel: "필터",
              filterPanelAddFilter: "필터 추가",
              filterPanelDeleteIconLabel: "삭제",
              filterPanelOperator: "연산자",
              filterPanelColumns: "데이터 열",
              filterPanelValue: "값",
              filterPanelOperatorAnd: "그리고",
              filterPanelOperatorOr: "또는",
              sortAscending: "오름차순 정렬",
              sortDescending: "내림차순 정렬",
              columnMenuSortAsc: "오름차순 정렬", // "Sort Ascending" 텍스트 변경
              columnMenuSortDesc: "내림차순 정렬", // "Sort Descending" 텍스트 변경
              columnMenuShowAll: "모두 표시", // "Show All" 텍스트 변경
              columnMenuFilter: "필터", // "Filter" 텍스트 변경
              columnMenuUnsort: "정렬 해제", // "Unsort" 텍스트 변경
              columnMenuHideColumn: "숨기기", // "Hide" 텍스트 변경
              columnMenuHideOn: "숨기기", // "Hide on" 텍스트 변경
              columnMenuManageColumns: "관리", // "Manage" 텍스트 변경
              // 페이지 관련 텍스트 변경
              page: "페이지",
              noRowsLabel: "데이터가 없습니다.",
              noResultsOverlayLabel: "결과가 없습니다.",
              errorOverlayDefaultLabel: "오류가 발생했습니다.",
              // 페이지네이션 관련 텍스트
              pageSize: "페이지 크기",
              pageSizeOptions: ["5", "10", "20"],
            }}
            rows={events} // 데이터
            columns={[
              { field: "id", headerName: "번호", flex: 0.5 },
              { field: "courseTitle", headerName: "강의명", flex: 1 },
              { field: "title", headerName: "제목", flex: 1.5 },
              { field: "description", headerName: "내용", flex: 1.5 },
              {
                field: "startDate",
                headerName: "시작 날짜",
                flex: 1.3,
                renderCell: (params) =>
                  moment(params.value).format("YYYY-MM-DD HH:mm"),
              },
              {
                field: "endDate",
                headerName: "종료 날짜",
                flex: 1.3,
                renderCell: (params) =>
                  moment(params.value).format("YYYY-MM-DD HH:mm"),
              },
              { field: "isExpired", headerName: "투표 여부", flex: 1.3 },
            ]}
            onRowClick={handleRowClick} // 행 클릭 시 이벤트
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            pageSizeOptions={[10]}
            checkboxSelection={role !== "ROLE_STUDENT"} // 행 선택을 위한 체크박스 추가
            onRowSelectionModelChange={(newSelection) => {
              setSelectedVotes(newSelection); // 상태 업데이트
            }}
            selectionModel={selectedVotes} // 선택된 ID 목록
          />
        </Box>

        {/* 등록, 수정, 삭제 버튼 */}
        <Box mt={2} sx={{ display: "flex", justifyContent: "flex-end" }}>
          {renderButtons()} {/* renderButtons 함수 호출 */}
        </Box>

        <Modal
          open={openModalVoteInfo}
          onClose={() => setOpenModalVoteInfo(false)}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              p: 4,
              borderRadius: "4px",
              boxShadow: 24,
            }}
          >
            {voteInfo ? (
              <>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  제목: {voteInfo.voteTitle} (
                  {voteInfo.isExpired ? "투표 종료" : "투표 진행중"})
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  style={{ marginBottom: "6px" }}
                >
                  {voteInfo.description}
                </Typography>
                <Box
                  sx={{
                    marginTop: "16px",
                    border: "1px solid #e4e4e4",
                    borderRadius: "4px",
                    display: "flex",
                    flexDirection: "column",
                    padding: "16px",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <PollIcon sx={{ marginRight: "4px" }} />
                    <Typography
                      className="voteTitlt"
                      gutterBottom
                      sx={{ margin: 0, fontWeight: 600 }}
                    >
                      투표
                    </Typography>
                  </Box>

                  {voteInfo.voteOptionInfoList &&
                  voteInfo.voteOptionInfoList.length > 0 ? (
                    <RadioGroup
                      className="voteOption"
                      value={selectedOption || ""} // 선택된 option의 voteOptionId를 설정
                      onChange={(e) => {
                        const selectedValue = Number(e.target.value); // 선택된 value (voteOptionId)를 가져옴
                        console.log("선택된 값:", selectedValue); // 선택된 값 확인

                        setSelectedOption(selectedValue); // 상태 업데이트
                      }}
                    >
                      {voteInfo.voteOptionInfoList.map((option) => (
                        <Box
                          sx={{
                            width: "100%",
                            backgroundColor: "#f6f8fa",
                            borderRadius: "4px",
                            padding: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <FormControlLabel
                            key={option.rank} // 고유한 키
                            value={option.rank}
                            control={
                              <Radio
                                disabled={
                                  role === "ROLE_ADMIN" ||
                                  role === "ROLE_TEACHER"
                                }
                              />
                            } // ROLE_ADMIN의 경우 비활성화
                            label={`${option.optionText}`}
                            // (현재 점유율: ${option.occupancyRate}, 투표 수: ${option.votes})
                          />
                        </Box>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Typography variant="body1">옵션이 없습니다.</Typography> // 옵션이 없을 때 메시지
                  )}
                  {/* 투표 버튼은 ROLE_ADMIN의 경우 표시하지 않음 */}
                  {role !== ("ROLE_ADMIN" || "ROLE_TEACHER") && (
                    <Button
                      variant="outlined"
                      onClick={handleVoteSubmit}
                      sx={{
                        backgroundColor: "#34495e",
                        color: "white",
                        fontWeight: 600,
                        border: "none",
                      }}
                    >
                      투표하기
                    </Button>
                  )}
                </Box>
              </>
            ) : (
              <Typography variant="body1">투표 정보를 불러오는 중…</Typography>
            )}
          </Box>
        </Modal>

        {/* 모달 */}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              borderRadius: "8px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              minHeight: 200,
              maxWidth: "100%",
              maxHeight: "90%",
              overflowY: "auto",
              padding: "26px",
              backgroundColor: "white",
            }}
          >
            <Typography id="modal-title" variant="h6">
              {"투표 등록"}
            </Typography>

            {/* 입력 필드 */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mt: 2,
              }}
            >
              <DateTimePicker
                label="시작 날짜"
                value={newEventStart}
                onChange={(newValue) => setNewEventStart(moment(newValue))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    style={{ marginBottom: "20px" }}
                  />
                )}
              />
              <DateTimePicker
                label="종료 날짜"
                value={newEventEnd}
                onChange={(newValue) => setNewEventEnd(moment(newValue))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    style={{ marginBottom: "20px" }}
                  />
                )}
              />
              {dateError && (
                <Typography color="error" variant="body2">
                  {dateError}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "grid" }}>
              <TextField
                fullwidth
                label="제목"
                value={newEventTitle}
                onChange={(e) => {
                  setNewEventTitle(e.target.value);
                }}
                style={{ marginTop: "16px" }}
              />
            </Box>
            <Box sx={{ display: "grid" }}>
              <TextField
                fullwidth
                label="내용"
                value={newEventDescription}
                onChange={(e) => {
                  setNewEventDescription(e.target.value);
                }}
                style={{ marginTop: "16px" }}
                multiline // TextField를 textarea로 변경
                rows={4} // 표시할 줄 수 (필요에 따라 조정 가능)
              />
            </Box>
            {/* 옵션 입력 필드 */}
            {newEventOptionText.map((option, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                  marginTop: "14px",
                }}
              >
                <TextField
                  label={`옵션 ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const updatedOptionText = [...newEventOptionText];
                    updatedOptionText[index] = e.target.value; // 값 변경
                    setNewEventOptionText(updatedOptionText);
                  }}
                  style={{ marginRight: "10px" }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteOptionText(index)}
                >
                  삭제
                </Button>
              </Box>
            ))}
            <Button variant="outlined" onClick={handleAddOptionText}>
              옵션 추가
            </Button>

            {/* 저장 및 취소 버튼 */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button variant="outlined" onClick={handleSaveEvent}>
                저장
              </Button>
              <Button variant="outlined" onClick={handleClose} sx={{ ml: 2 }}>
                취소
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </LocalizationProvider>
  );
};

export default Vote;
