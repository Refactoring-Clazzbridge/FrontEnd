import React, { useState, useEffect } from "react";
import { Button, Modal, Typography, TextField, Box, FormControl, InputLabel, Select, MenuItem, IconButton, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import apiClient from '../../shared/apiClient';
import { DataGrid } from '@mui/x-data-grid'; // DataGrid 임포트
import { v4 as uuidv4 } from 'uuid'; // 고유한 ID를 생성하기 위해 uuid 패키지 사용
import CustomSnackbar from "../../components/common/CustomSnackbar"; // 커스텀 스낵바

const MemberManager = () => {
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedMembers, setSelectedMembers] = useState([]); // 선택한 회원 상태 관리

    // 폼 입력 상태 관리
    const [newEventId, setNewEventId] = useState(''); // ID 추가
    const [newEventName, setNewEventName] = useState('');
    const [newEventMemberId, setNewEventMemberId] = useState('');
    const [newEventPassword, setNewEventPassword] = useState('');
    const [newEventPhone, setNewEventPhone] = useState('');
    const [newEventEmail, setNewEventEmail] = useState('');
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventType, setNewEventType] = useState('수강생');

    const [events, setEvents] = useState([]);
    const [showPassword, setShowPassword] = useState(false); // 비밀번호 보이기 상태 관리
    const [courseOption, setCourseOption] = useState([]); // 강의명 목록 상태

    const [openSnackbar, setOpenSnackbar] = useState(false); // 스낵바 열기 상태
    const [snackbarMessage, setSnackbarMessage] = useState(""); // 스낵바 메시지
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 스낵바 성공/실패 유무
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false); // 스낵바 닫기
    };

    // 에러 상태 관리
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [nameError, setNameError] = useState('');
    const [memberIdError, setMemberIdError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^(01[016789])-\d{3,4}-\d{4}$/;

    const validateName = (name) => {
        if (name.length < 2 || name.includes(" ")) {
            setNameError("2글자 이상이거나 공백이 들어가면 안됩니다.");
            return;
        } else {
            setNameError('');
        }
    };

    const validateMemberId = (memberId) => {
        if (memberId.length < 5 || memberId.includes(" ")) {
            setMemberIdError("5글자 이상이거나 공백이 들어가면 안됩니다.");
            return;
        } else {
            setMemberIdError('');
        }
    };

    const validatePassword = (password) => {
        if (password.length < 8 || password.includes(" ") || password.length === 0) {
            setPasswordError("8글자 이상이거나 공백이 들어가면 안됩니다.");
            return;
        } else {
            setPasswordError('');
        }
    };

    useEffect(() => {
        // 페이지가 처음 로드될 때 API에서 데이터를 가져옵니다.
        fetchEvents();
        fetchCourse();
    }, []); // 빈 배열로 처음에 한 번만 실행

    const fetchEvents = () => {
        apiClient.get('user')
            .then(response => {
                const fetchedEvents = response.data.map(event => ({
                    ...event,
                }));
                setEvents(fetchedEvents); // 3. 상태 업데이트
            })
            .catch(error => {
                console.error('이벤트 데이터를 불러오지 못했습니다.', error);
            });
    };

    const fetchCourse = () => {
        // 강의명 목록을 가져오는 API 호출
        apiClient.get('course/title')
            .then(response => {
                setCourseOption(response.data); // 강의명 목록 설정
            })
            .catch(error => {
                console.error('강의명 목록을 불러오지 못했습니다.', error);
            });
    };

    // 폼 초기화
    const resetForm = () => {
        setNewEventName('');
        setNewEventMemberId('');
        setNewEventPassword('');
        setNewEventPhone('');
        setNewEventEmail('');
        setNewEventTitle('');
        setNewEventType('수강생');
        setNameError('');
        setMemberIdError('');
        setPhoneError('');
        setEmailError('');
        setPasswordError('');
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

    // 신규 회원 추가
    const addMember = (newMember) => {
        apiClient.post('user', newMember) // ID 없이 회원 추가
            .then(response => {
                const addedCourse = {
                    ...response.data,
                    id: response.data.id || uuidv4(), // 서버가 `id`를 주지 않으면 클라이언트에서 임시로 생성
                };
                setEvents([...events, addedCourse]);// 응답으로 받은 새 회원 추가
                setSnackbarMessage('회원이 추가되었습니다.');
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
                handleClose();
                fetchEvents(); // 추가 후 이벤트 목록 새로 고침
            })
            .catch(error => {
                console.error('회원 추가에 실패했습니다.', error);
            });
    };

    // 기존 회원 수정
    const updateMember = (updatedMember) => {
        apiClient.put('user', updatedMember) // ID 포함하여 수정
            .then(response => {
                const updatedEvents = events.map(event =>
                    event.id === selectedEvent.id ? { ...event, ...updatedMember } : event
                );
                setEvents(updatedEvents);
                setSnackbarMessage('회원 정보가 수정되었습니다.');
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
                handleClose();
                fetchEvents(); // 수정 후 이벤트 목록 새로 고침
            })
            .catch(error => {
                console.error('회원 수정에 실패했습니다.', error);
            });
    };

    // 이벤트 추가 또는 업데이트 핸들러
    const handleSaveEvent = () => {
        const newMember = {
            id: newEventId,
            name: newEventName,
            memberId: newEventMemberId,
            password: newEventPassword,
            phone: newEventPhone,
            email: newEventEmail,
            courseTitle: newEventTitle,
            memberType: newEventType,
        };

        // 중복된 memberId와 email이 있는지 확인
        const existingMemberId = events.find(event => event.memberId === newEventMemberId && (!editMode || event.id !== newEventId));
        const existingEmail = events.find(event => event.email === newEventEmail && (!editMode || event.id !== newEventId));

        if (existingMemberId) {
            setSnackbarMessage('이미 등록된 아이디입니다.');
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }

        if (existingEmail) {
            setSnackbarMessage('이미 등록된 이메일입니다.');
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }

        // 강사일 경우 해당 강의에 이미 강사가 배정되어 있는지 확인
        if (newEventType === 'ROLE_TEACHER') {
            const existingTeacherForCourse = events.find(
                (event) => event.courseTitle === newEventTitle && event.memberType === 'ROLE_TEACHER'
            );

            if (existingTeacherForCourse && (!editMode || existingTeacherForCourse.id !== newEventId)) {
                setSnackbarMessage(`해당 강의(${newEventTitle})에는 이미 강사가 배정되어 있습니다.`);
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
                return; // 강사가 이미 배정된 경우 저장 중단
            }
        }

        if (nameError || phoneError || emailError || passwordError || memberIdError) {
            setSnackbarMessage("올바른 형식으로 입력해주세요.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }

        if (editMode) {
            // 수정
            if (newEventPassword.length === 0) {
                setPasswordError("비밀번호를 입력해 주세요.");
                return;
            }
            updateMember(newMember); // ID를 전달
        } else {
            // 추가
            if (newEventName.length === 0 || newEventMemberId.length === 0 || newEventPassword.length === 0 ||
                newEventPhone.length === 0 || newEventEmail.length === 0 || newEventTitle.length === 0 ||
                ((newEventType !== 'ROLE_TEACHER') && (newEventType !== 'ROLE_STUDENT'))) {
                setSnackbarMessage("입력하지 않은 값이 있습니다.");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
                return;
            }
            addMember(newMember);
        }
    };

    // 회원 삭제 핸들러
    const deleteSelectedMembers = () => {
        // 선택된 회원 수를 확인
        const memberCount = selectedMembers.length;

        if (memberCount === 0) {
            setSnackbarMessage("삭제할 회원을 선택하세요");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }

        const confirmation = window.confirm(`선택된 회원 ${memberCount}명을 삭제하시겠습니까?`); // window.confirm 팝업창

        if (confirmation) {
            const deletePromises = selectedMembers.map(id => {
                console.log("Deleting member with ID:", id); // 삭제할 memberId 확인
                return apiClient.delete(`user/${id}`);
            });

            Promise.all(deletePromises)
                .then(() => {
                    const updatedEvents = events.filter(event => !selectedMembers.includes(event.id));
                    setEvents(updatedEvents);
                    setSelectedMembers([]); // 선택한 회원 목록 초기화
                    setSnackbarMessage(`${memberCount}명의 회원 삭제 성공`);
                    setSnackbarSeverity("success");
                    setOpenSnackbar(true);
                })
                .catch(error => {
                    console.error('회원 정보를 삭제하지 못했습니다.', error.response.data);
                    setSnackbarMessage('회원 삭제 실패: ' + error.response.data.message); // 서버에서 받은 오류 메시지를 출력
                    setSnackbarSeverity("error");
                    setOpenSnackbar(true);
                });
        } else {
            // 사용자가 삭제를 취소했을 때의 처리
            return;
        }
    };

    // 회원 수정 핸들러
    const editSelectedMember = () => {
        if (selectedMembers.length !== 1) {
            setSnackbarMessage('수정할 회원은 하나만 선택해야 합니다.');
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }

        const memberToEdit = events.find(event => event.id === selectedMembers[0]);
        if (memberToEdit) {
            setSelectedEvent(memberToEdit);
            setNewEventId(memberToEdit.id);
            setNewEventName(memberToEdit.name);
            setNewEventMemberId(memberToEdit.memberId);
            setNewEventPassword(''); // 비밀번호 필드를 비워둡니다.
            setNewEventPhone(memberToEdit.phone);
            setNewEventEmail(memberToEdit.email);
            setNewEventTitle(memberToEdit.courseTitle);
            setNewEventType(memberToEdit.memberType);
            setEditMode(true);
            setOpen(true);
        }
    };

    // 비밀번호 가리기/보이기 토글 핸들러
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
            {/* 회원 리스트 테이블 */}

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

                        { field: 'id', headerName: '번호', flex: 0.5 },
                        {
                            field: 'memberType', headerName: '회원종류', flex: 1,
                            valueGetter: (events) => {
                                switch (events) {
                                    case 'ROLE_TEACHER':
                                        return '강사';
                                    default:
                                        //console.log(events);
                                        return '수강생';

                                }
                            }
                        },
                        { field: 'name', headerName: '이름', flex: 1 },
                        { field: 'memberId', headerName: '아이디', flex: 1 },
                        { field: 'phone', headerName: '전화번호', flex: 1.3 },
                        { field: 'email', headerName: '이메일', flex: 1.3 },
                        { field: 'courseTitle', headerName: '강의명', flex: 1.5, ml: 30 },
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
                        setSelectedMembers(newSelection); // 상태 업데이트

                    }}

                    selectionModel={selectedMembers} // 선택된 ID 목록
                />
            </Box>

            {/* 등록, 수정, 삭제 버튼 */}
            <Box mt={2} sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={handleOpen} sx={{ mr: 2 }}>
                    회원 등록
                </Button>
                <Button variant="outlined" onClick={editSelectedMember} sx={{ mr: 2 }}>
                    회원 수정
                </Button>
                <Button variant="outlined" onClick={deleteSelectedMembers}>
                    회원 삭제
                </Button>
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
                        maxWidth: "600px",
                        margin: "auto",
                        top: "20%",
                        position: "relative",
                    }}
                >
                    <Typography id="modal-title" variant="h6">
                        {editMode ? "회원 수정" : "회원 등록"}
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
                        <TextField
                            label="이름"
                            value={newEventName}
                            onChange={(e) => {
                                setNewEventName(e.target.value);
                                validateName(e.target.value);
                            }}
                            error={!!nameError}
                            helperText={nameError}
                        />
                        <TextField
                            label="아이디"
                            value={newEventMemberId}
                            onChange={(e) => {
                                setNewEventMemberId(e.target.value);
                                validateMemberId(e.target.value);
                            }}
                            error={!!memberIdError}
                            helperText={memberIdError}
                        // disabled={editMode} // 수정 모드에서는 아이디 수정 불가
                        />
                        <Box sx={{ display: "grid" }}>
                            <TextField
                                fullwidth
                                label="비밀번호"
                                type={showPassword ? "text" : "password"} // 상태에 따라 변경
                                onChange={(e) => {
                                    setNewEventPassword(e.target.value);
                                    validatePassword(e.target.value);
                                }}

                                error={!!passwordError}
                                helperText={passwordError}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={togglePasswordVisibility}
                                            aria-label="toggle password visibility"
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    ),
                                }}
                            />
                        </Box>
                        <TextField
                            label="전화번호"
                            value={newEventPhone}
                            onChange={(e) => {
                                setNewEventPhone(e.target.value);
                                if (!phonePattern.test(e.target.value) && e.target.value !== '') {
                                    setPhoneError(
                                        <>
                                            올바른 전화번호 형식이 아닙니다.<br />
                                            예) 010-xxxx-xxxx
                                        </>);
                                } else {
                                    setPhoneError('');
                                }
                            }}
                            error={!!phoneError}
                            helperText={phoneError}
                        />
                        <TextField
                            label="이메일"
                            value={newEventEmail}
                            onChange={(e) => {
                                setNewEventEmail(e.target.value);
                                if (!emailPattern.test(e.target.value) && e.target.value !== '') {
                                    setEmailError(
                                        <>
                                            올바른 이메일 형식이 아닙니다.<br />
                                            예) human@naver.com
                                        </>);
                                } else {
                                    setEmailError('');
                                }
                            }}
                            error={!!emailError}
                            helperText={emailError}
                        />
                        <FormControl variant="outlined">
                            <InputLabel>강의명</InputLabel>
                            <Select
                                label="강의명"
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                            >
                                {courseOption.map((course, index) => (
                                    <MenuItem key={index} value={course.courseTitle}>
                                        {course.courseTitle}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {/* 라디오 버튼: 회원 종류 선택 */}
                        <FormControl component="fieldset">
                            <Typography>회원 종류</Typography>
                            <RadioGroup
                                row
                                value={newEventType}
                                onChange={(e) => setNewEventType(e.target.value)}
                            >
                                {/* 수정 모드에서는 회원 종류 수정 불가 */}
                                <FormControlLabel value="ROLE_STUDENT" control={<Radio />} label="수강생" disabled={editMode} />
                                <FormControlLabel value="ROLE_TEACHER" control={<Radio />} label="강사" disabled={editMode} />
                            </RadioGroup>
                        </FormControl>
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
        </div>
    );
};

export default MemberManager;