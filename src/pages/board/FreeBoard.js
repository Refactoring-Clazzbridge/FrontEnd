import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PostAddIcon from "@mui/icons-material/PostAdd";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import {
  Box,
  Button,
  TextField,
  Drawer,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import CustomModal from "../../components/common/CustomModal";
import { getUserCourseFreePosts } from "../../services/apis/post/get";
import { savePost } from "../../services/apis/post/post";
import { deletePost as deletePostApi } from "../../services/apis/post/delete";
import { getCourseIdForUser } from "../../services/apis/course/get";
import { updatePost } from "../../services/apis/post/put";
import { getBoardType } from "../../services/apis/boardType/get";
import PostComment from "../../components/comment/PostComment";

const columns = [
  { field: "id", headerName: "No", flex: 0.5, resizable: false },
  {
    field: "boardType",
    flex: 1,
    headerName: "카테고리",
    resizable: false,
  },
  {
    field: "title",
    flex: 4,
    headerName: "제목",
    resizable: false,
  },
  {
    field: "authorName",
    headerName: "작성자",
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

export default function FreeBoard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [originalRows, setOriginalRows] = useState([]); // 원본 데이터 보존
  const [filteredRows, setFilteredRows] = useState([]); // 필터링된 데이터

  const [userCourseId, setUserCourseId] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false); // Drawer 열기 상태
  const [selectedRow, setSelectedRow] = useState(null); // 선택된 행 데이터
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false); // Snackbar 열기 상태
  const [successMessage, setSuccessMessage] = useState("");
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false); // Snackbar 열기 상태
  const [errorMessage, setErrorMessage] = useState("");

  const [originalRow, setOriginalRow] = useState(null);
  const [boardTypes, setBoardTypes] = useState([]); // 카테고리 상태
  const [boardId, setBoardId] = useState(""); // 선택된 카테고리 ID 상태

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setFilteredRows(originalRows);
      return;
    }
    const normalizedSearch = debouncedSearch.replace(/\s+/g, "").toLowerCase();

    const filtered = originalRows.filter((row) => {
      // 각 필드값을 문자열로 변환하고 공백을 제거한 후 검색
      return Object.values(row).some((field) => {
        // null이나 undefined 체크
        if (field == null) return false;

        const normalizedField = String(field).replace(/\s+/g, "").toLowerCase();
        return normalizedField.includes(normalizedSearch);
      });
    });

    setFilteredRows(filtered);
  }, [debouncedSearch, originalRows]);

  // 검색 처리 함수
  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const fetchData = useCallback(async () => {
    const data = await getUserCourseFreePosts(); // API 호출
    setOriginalRows(data); // 원본 데이터 저장
    setFilteredRows(data); // 필터링된 데이터 초기화
  }, []);

  const fetchBoardTypes = useCallback(async () => {
    try {
      const userCourseId = await getCourseIdForUser();
      setUserCourseId(userCourseId);
      const data = await getBoardType(); // API 호출
      setBoardTypes(data); // 카테고리 데이터 상태에 저장
    } catch (error) {
      console.error("Failed to fetch board types:", error);
    }
  }, []);

  useEffect(() => {
    const userInfoString = localStorage.getItem("userInfo");
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);
      setCurrentUser(userInfo);
    }
  }, []);

  useEffect(() => {
    fetchBoardTypes();
    fetchData();
  }, [fetchData, fetchBoardTypes, currentUser]); // 컴포넌트 마운트 시 호출

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isupdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false); // 수정 모드 상태 추가

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const openUpdateModal = () => setIsUpdateModalOpen(true);
  const closeUpdateModal = () => setIsUpdateModalOpen(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleEditClick = (row) => {
    setOriginalRow(row); // 원래 행 데이터 저장
    setSelectedRow(row); // 선택된 행 데이터 설정
    setIsEditing(true); // 수정 모드 활성화
  };

  const handleCancel = () => {
    setSelectedRow(originalRow); // 원래 값으로 되돌리기
    setIsEditing(false); // 편집 모드 해제
  };

  const handleSaveClick = async (updateDTO) => {
    try {
      await updatePost(updateDTO);
      await fetchData(); // 데이터 새로 고침
      setIsEditing(false); // 수정 모드 비활성화
      setIsUpdateModalOpen(false);
      setSuccessMessage("게시물이 성공적으로 수정되었습니다."); // 메시지 설정
      setOpenSuccessSnackbar(true); // Snackbar 열기
    } catch (error) {
      switch (error.response.status) {
        case 400:
          setErrorMessage("게시글의 제목은 필수 입력 사항입니다.");
          break;
        case 401:
          setErrorMessage("수정 권한이 없습니다.");
          break;
        default:
          setErrorMessage("게시글 수정 실패.");
          break;
      }
      closeUpdateModal();
      setOpenErrorSnackbar(true);
    }
  };

  const handleBoardIdChange = (event) => {
    setBoardId(event.target.value); // 선택된 카테고리 ID
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const postForm = {
    title,
    content,
    boardId,
    courseId: userCourseId,
  };

  const postSave = async () => {
    try {
      await savePost(postForm);

      setSuccessMessage("게시물이 성공적으로 저장되었습니다."); // 메시지 설정
      setOpenSuccessSnackbar(true); // Snackbar 열기
      await fetchData(); // 데이터 새로 고침
      closeModal();
      setTitle("");
      setBoardId("");
      setContent("");
    } catch (error) {
      console.error("게시물 등록 실패 ");
      setSuccessMessage("게시물 저장에 실패했습니다."); // 실패 메시지 설정
      setTitle("");
      setBoardId("");
      setContent("");
      setOpenSuccessSnackbar(true); // Snackbar 열기
    }
  };

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  // 체크박스 리스트 받아오기
  const [selectedIds, setSelectedIds] = useState([]); // 선택된 행 ID 상태 추가
  const handleSelectionChange = (newSelection) => {
    setSelectedIds(newSelection); // 선택된 행 ID 업데이트
  };

  const deletePost = async (selectedIds) => {
    try {
      await deletePostApi(selectedIds);
      setSuccessMessage("게시물이 성공적으로 삭제되었습니다."); // 메시지 설정
      setOpenSuccessSnackbar(true); // Snackbar 열기
      await fetchData(); // 데이터 새로 고침
      closeDeleteModal();
      setOpenDrawer(false);
    } catch (error) {
      switch (error.response.status) {
        case 401:
          setErrorMessage("삭제 권한이 없습니다.");
          break;
        default:
          setErrorMessage("게시글 삭제 실패.");
          break;
      }
      closeDeleteModal();
      setOpenErrorSnackbar(true);
    }
  };

  const handleRowClick = (params) => {
    setSelectedRow(params.row); // 클릭된 행 데이터 저장
    setOpenDrawer(true); // Drawer 열기
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false); // Drawer 닫기
    setIsEditing(false); // 수정 모드 비활성화
    setSelectedRow(null); // 선택된 행 데이터 초기화
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      // ESC 키 확인
      handleCloseDrawer(); // Drawer 닫기 함수 호출
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          height: "40px",
          gap: "12px",
          marginBottom: 2,
        }}
      >
        <TextField
          className="searchBar"
          size="small"
          placeholder="검색어를 입력하세요..."
          value={search}
          onChange={handleSearch}
          sx={{ width: "300px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Tooltip title="작성하기">
          <Button
            variant="outlined"
            sx={{ width: "38px", height: "38px" }}
            onClick={openModal}
          >
            <PostAddIcon /> {/* 아이콘만 표시 */}
          </Button>
        </Tooltip>
        {currentUser?.member?.memberType === "ROLE_ADMIN" && (
          <Tooltip title="삭제하기">
            <Button
              variant="outlined"
              sx={{ width: "38px", height: "38px" }}
              onClick={openDeleteModal}
            >
              <DeleteOutlineIcon />
            </Button>
          </Tooltip>
        )}
      </Box>
      {/* ========== 삭제 ========= */}
      <CustomModal isOpen={isDeleteModalOpen} closeModal={closeDeleteModal}>
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
          <h3>게시글 삭제하기</h3>
          <p>
            {selectedIds.length === 1
              ? "해당 게시글을 삭제하시겠습니까?"
              : `${selectedIds.length}개의 게시글을 삭제하시겠습니까?`}
          </p>

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
              onClick={closeDeleteModal}
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
              onClick={() => {
                deletePost(selectedIds);
              }}
              sx={{
                width: "120px",
                height: "40px",
                backgroundColor: "#34495e",
                fontWeight: 600,
              }}
            >
              삭제하기
            </Button>
          </Box>
        </Box>
      </CustomModal>

      {/* ========== 수정 ========= */}
      <CustomModal isOpen={isupdateModalOpen} closeModal={closeUpdateModal}>
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
          <h3>게시글 수정하기</h3>
          <p>해당 게시글을 수정하시겠습니까?</p>

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
              onClick={closeUpdateModal}
              sx={{ width: "120px", height: "40px" }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              color="info"
              onClick={() => {
                const updateDTO = {
                  id: selectedRow.id,
                  title: title || selectedRow.title,
                  content: content || selectedRow.content,
                };
                handleSaveClick(updateDTO);
              }}
              sx={{
                width: "120px",
                height: "40px",
                backgroundColor: "#34495e",
                fontWeight: 600,
              }}
            >
              수정하기
            </Button>
          </Box>
        </Box>
      </CustomModal>

      {/* ========== 작성 ========= */}
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
          }}
        >
          <h3>게시글 작성하기</h3>
          {/* 카테고리 선택 */}
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">카테고리</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="카테고리"
              onChange={handleBoardIdChange}
              value={boardId}
            >
              {boardTypes
                .filter(
                  (boardType) =>
                    currentUser?.member?.memberType === "ROLE_ADMIN" ||
                    boardType.type !== "공지사항"
                ) // 관리자가 아니면 "공지사항" 제외
                .map((boardType) => (
                  <MenuItem key={boardType.id} value={boardType.id}>
                    {boardType.type}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* 제목 */}
          <TextField
            fullWidth
            id="outlined-basic"
            label="제목"
            variant="outlined"
            onChange={handleTitleChange}
            value={title}
          />

          {/* 내용 */}
          <TextField
            fullWidth
            label="내용"
            variant="outlined"
            id="outlined-multiline-static"
            multiline
            rows={14}
            onChange={handleContentChange}
            value={content}
            sx={{ whiteSpace: "pre-wrap" }}
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
              onClick={postSave}
              style={{
                backgroundColor: "#34495e",
              }}
              sx={{
                width: "120px",
                height: "40px",
                fontWeight: 600,
              }}
            >
              등록하기
            </Button>
          </Box>
        </Box>
      </CustomModal>

      <Box sx={{ height: "400px", whiteSpace: "100%" }}>
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
          rows={filteredRows}
          checkboxSelection={currentUser?.member?.memberType === "ROLE_ADMIN"}
          onRowClick={handleRowClick}
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
            noRowsLabel: "자유게시판 게시글이 없습니다.",

            noResultsOverlayLabel: "결과가 없습니다.",
            errorOverlayDefaultLabel: "오류가 발생했습니다.",
            // 페이지네이션 관련 텍스트
            pageSize: "페이지 크기",
            pageSizeOptions: ["5", "10", "20"],
          }}
          onRowSelectionModelChange={handleSelectionChange}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
          style={{ height: "628px" }}
        />
      </Box>

      {/* 성공 Snackbar */}
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={2200}
        onClose={handleCloseSuccessSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSuccessSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* 에러 Snackbar */}
      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={2200}
        onClose={handleCloseErrorSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseErrorSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Drawer
        anchor="right" // 오른쪽에서 슬라이드
        open={openDrawer}
        onClose={handleCloseDrawer}
        sx={{ zIndex: 1300 }} // zIndex 설정
      >
        <Box
          sx={{ width: 800, padding: 2 }} // Drawer의 너비 및 패딩 설정
          role="presentation"
          // onClick={handleCloseDrawer} // Drawer 클릭 시 닫기
          onKeyDown={handleKeyDown}
        >
          {selectedRow ? (
            <Box sx={{ padding: "28px" }}>
              <Typography
                sx={{
                  color: "gray",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {selectedRow.boardType}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: "4px",
                }}
              >
                {isEditing ? (
                  <TextField
                    value={selectedRow.title}
                    onChange={(e) => {
                      const newTitle = e.target.value; // 입력된 값
                      setTitle(newTitle); // 제목 상태 업데이트
                      setSelectedRow((prevRow) => ({
                        ...prevRow,
                        title: newTitle,
                      })); // 선택된 행의 제목 업데이트} // 제목 상태 업데이트
                    }}
                    sx={{ fontSize: "30px", fontWeight: "bold", flex: 1 }}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontSize: "30px",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedRow.title}
                  </Typography>
                )}
                <Box sx={{ color: "gray", marginLeft: "10px", width: "116px" }}>
                  <Typography sx={{ fontSize: "12px" }}>
                    작성자: {selectedRow.authorName}
                  </Typography>
                  <Typography sx={{ fontSize: "12px" }}>
                    작성날짜: {selectedRow.createdAt}
                  </Typography>
                </Box>
              </Box>
              {/* 선 */}
              <Box
                sx={{
                  borderBottom: "1px solid #d4d4d4",
                  borderBottomWidth: "0.1px",
                  marginBottom: "30px",
                }}
              />

              <Box
                sx={{
                  height: "100%",
                  padding: "24px 0 24px 0",
                  whiteSpace: "pre-wrap",
                }}
              >
                {isEditing ? (
                  <TextField
                    multiline
                    focused
                    rows={19}
                    value={selectedRow.content}
                    onChange={(e) => {
                      const newContent = e.target.value; // 입력된 값
                      setContent(newContent); // 제목 상태 업데이트
                      setSelectedRow((prevRow) => ({
                        ...prevRow,
                        content: newContent,
                      }));
                    }}
                    sx={{ flex: 1, width: "100%", row: 5 }}
                  />
                ) : (
                  <Typography sx={{ fontSize: "14px" }}>
                    {selectedRow.content}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                {currentUser &&
                  currentUser.member &&
                  (currentUser.member.id === selectedRow.authorId ||
                    currentUser.member.memberType === "ROLE_ADMIN") && (
                    <>
                      {isEditing ? (
                        <Button variant="outlined" onClick={openUpdateModal}>
                          저장
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          onClick={() => handleEditClick(selectedRow)}
                        >
                          수정
                        </Button>
                      )}

                      {isEditing ? (
                        <Button variant="outlined" onClick={handleCancel}>
                          취소
                        </Button>
                      ) : (
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
              <Box
                sx={{
                  borderBottom: "1px solid #d4d4d4",
                  borderBottomWidth: "0.1px",
                  marginTop: "30px",
                  marginBottom: "10px",
                }}
              />

              <PostComment postId={selectedRow.id} />
            </Box>
          ) : (
            <Typography>선택된 게시글이 없습니다.</Typography>
          )}
        </Box>
      </Drawer>
    </>
  );
}
