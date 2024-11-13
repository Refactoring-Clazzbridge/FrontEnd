import React, { useState, useEffect } from "react";
import { Button, Modal, Typography, TextField, Box } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid'; // DataGrid 임포트
import apiClient from '../../shared/apiClient';
import { v4 as uuidv4 } from 'uuid'; // 고유한 ID를 생성하기 위해 uuid 패키지 사용
import CustomSnackbar from "../../components/common/CustomSnackbar"; // 커스텀 스낵바
import CustomModal from "../../components/common/CustomModal"; // 커스텀 모달

const ClassroomManager = () => {
    const [openModal, setOpenModal] = useState(false);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedClassrooms, setSelectedClassrooms] = useState([]); // 선택한 강의실 상태 관리

    // 폼 입력 상태 관리
    const [newEventId, setNewEventId] = useState(''); // ID 추가
    const [newEventName, setNewEventName] = useState('');
    const [newEventIsOccupied, setNewEventIsOccupied] = useState('');

    const [openSnackbar, setOpenSnackbar] = useState(false); // 스낵바 열기 상태
    const [snackbarMessage, setSnackbarMessage] = useState(""); // 스낵바 메시지
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 스낵바 성공/실패 유무
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false); // 스낵바 닫기
    };

    const [events, setEvents] = useState([]);

    // 에러 상태 관리
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        // 페이지가 처음 로드될 때 API에서 데이터를 가져옵니다.
        fetchEvents();
    }, []); // 빈 배열로 처음에 한 번만 실행

    const fetchEvents = () => {
        apiClient.get('classroom')
            .then(response => {
                const fetchedEvents = response.data.map(event => ({
                    ...event,
                    isOccupied: event.isOccupied ? '사용중' : '사용 안함', // 표시용 변환
                }));
                setEvents(fetchedEvents);
            })
            .catch(error => {
                console.error('이벤트 데이터를 불러오지 못했습니다.', error);
            });
    };

    // 폼 초기화
    const resetForm = () => {
        setNewEventName('');
        setNewEventIsOccupied('');
        setNameError('');
    };

    // 모달 열기 및 닫기
    const handleOpen = () => {
        setEditMode(false);
        setSelectedEvent(null);
        resetForm();
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    // 신규 강의실 추가
    const addClassroom = (newClassroom) => {
        apiClient.post('classroom', newClassroom)
            .then(response => {
                const addedClassroom = {
                    ...response.data,
                    id: response.data.id || uuidv4(), // 서버가 `id`를 주지 않으면 클라이언트에서 임시로 생성
                };
                setEvents([...events, addedClassroom]);
                setSnackbarMessage('강의실이 추가되었습니다.');
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
                handleClose();
                fetchEvents();
            })
            .catch(error => {
                console.error('강의실 추가에 실패했습니다.', error);
            });
    };

    // 기존 강의실 수정
    const updateClassroom = (updatedClassroom) => {
        apiClient.put('classroom', updatedClassroom)
            .then(response => {
                const updatedEvents = events.map(event =>
                    event.id === selectedEvent.id ? { ...event, ...updatedClassroom } : event
                );
                setEvents(updatedEvents);
                setSnackbarMessage('강의실 정보가 수정되었습니다.');
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
                handleClose();
                fetchEvents();
            })
            .catch(error => {
                console.error('강의실 수정에 실패했습니다.', error);
            });
    };

    // 이벤트 추가 또는 업데이트 핸들러
    const handleSaveEvent = () => {
        const newClassroom = {
            id: newEventId,
            name: newEventName,
            isOccupied: newEventIsOccupied,
        };

        const existingClassroom = events.find(event => event.name === newEventName && (!editMode || event.id !== newEventId));

        if (existingClassroom) {
            setSnackbarMessage("이미 등록된 강의실입니다.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }
        if (newClassroom.name.length < 2) {
            setSnackbarMessage("두 글자 이상 입력해주세요.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }

        if (editMode) {
            updateClassroom(newClassroom);
        } else {
            addClassroom(newClassroom);
        }
    };

    const handleDeleteConfirmation = () => {
        const deletePromises = selectedClassrooms.map(id => apiClient.delete(`classroom/${id}`));

        Promise.all(deletePromises)
            .then(() => {
                const updatedEvents = events.filter(event => !selectedClassrooms.includes(event.id));
                setEvents(updatedEvents);
                setSelectedClassrooms([]); // 삭제 후 선택된 강의실 목록 초기화
                setSnackbarMessage(`${selectedClassrooms.length}개 강의실 삭제 성공`);
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
            })
            .catch(error => {
                console.error('강의실 정보를 삭제하지 못했습니다.', error.response.data);
                setSnackbarMessage('강의실 삭제 실패: ' + error.response.data.message);
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
            });
        setOpenModal(false); // 모달 닫기
    };

    // 강의실 삭제 핸들러
    const deleteSelectedClassrooms = () => {
        if (selectedClassrooms.length === 0) {
            setSnackbarMessage("삭제할 강의실을 선택하세요");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }
        setOpenModal(true); // 모달 열기
    };


    // 강의실 수정 핸들러
    const editSelectedClassroom = () => {
        if (selectedClassrooms.length !== 1) {
            setSnackbarMessage('수정할 강의실은 하나만 선택해야 합니다.');
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }

        const classroomToEdit = events.find(event => event.id === selectedClassrooms[0]);
        if (classroomToEdit) {
            setSelectedEvent(classroomToEdit);
            setNewEventId(classroomToEdit.id);
            setNewEventName(classroomToEdit.name);

            setEditMode(true);
            setOpen(true);
        }
    };

    return (
        <div>
            {/* 커스텀 스낵바 */}
            <CustomSnackbar
                open={openSnackbar}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={handleCloseSnackbar}
            />
            {/* 강의실 리스트 테이블 DataGrid로 변경 */}
            <Box sx={{ height: 650, width: '100%' }}>
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
                        { field: 'id', headerName: '번호', flex: 1 },
                        { field: 'name', headerName: '강의실명', flex: 5 },
                        { field: 'isOccupied', headerName: '점유여부', flex: 1 },
                    ]}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    pageSizeOptions={[10]}
                    checkboxSelection // 행 선택을 위한 체크박스 추가
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectedClassrooms(newSelection); // 상태 업데이트

                    }}

                    selectionModel={selectedClassrooms} // 선택된 ID 목록
                />
            </Box>

            {/* 등록, 수정, 삭제 버튼 */}
            <Box mt={2} sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={handleOpen} sx={{ mr: 2 }}>
                    강의실 등록
                </Button>
                <Button variant="outlined" onClick={editSelectedClassroom} sx={{ mr: 2 }}>
                    강의실 수정
                </Button>
                <div>
                    <Button variant="outlined" onClick={deleteSelectedClassrooms} sx={{ mr: 2 }}>
                        강의실 삭제
                    </Button>

                    {/* Custom Modal */}
                    <CustomModal isOpen={openModal} closeModal={() => setOpenModal(false)}>
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
                            <h3>강의실 삭제</h3>
                            <p>선택된 강의실 {selectedClassrooms.length}개를 삭제하시겠습니까?</p>
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
            </Box>

            {/* 모달 */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        p: 4,
                        backgroundColor: "white",
                        borderRadius: "8px",
                        maxWidth: "400px",
                        margin: "auto",
                        top: "20%",
                        position: "relative",
                    }}
                >
                    <Typography id="modal-title" variant="h6">
                        {editMode ? "강의실 수정" : "강의실 등록"}
                    </Typography>

                    {/* 입력 필드 */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: 2,
                            mt: 2,
                        }}
                    >
                        <TextField
                            label="강의실명"
                            value={newEventName}
                            onChange={(e) => setNewEventName(e.target.value)}
                            error={!!nameError}
                            helperText={nameError}
                        />
                    </Box>

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
        </div >
    );
};

export default ClassroomManager;
