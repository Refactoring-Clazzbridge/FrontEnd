import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import {
  Button,
  Typography,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import apiClient from "../../shared/apiClient";
import CustomModal from "../../components/common/CustomModal";
import "../../styles/calendar.css";
import "moment/locale/ko"; // 한국어 로케일 불러오기

moment.locale("ko");

const messages = {
  allDay: "종일",
  previous: "이전 달",
  next: "다음 달",
  today: "오늘",
  month: "월",
  week: "주",
  day: "일",
  agenda: "일정",
  date: "날짜",
  time: "시간",
  event: "이벤트",
  noEventsInRange: "해당 기간에 이벤트가 없습니다.",
  showMore: (total) => `+ 더보기 (${total})`,
};

const localizer = momentLocalizer(moment);

const Calendars = ({ readOnly }) => {
  // 모달 상태 관리
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // 폼 입력 상태 관리
  const [newEventcourseTitle, setNewEventcourseTitle] = useState("");
  const [newEventEventTitle, setNewEventEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventStart, setNewEventStart] = useState(moment());
  const [newEventEnd, setNewEventEnd] = useState(moment().add(1, "hour"));

  const [error, setError] = useState("");

  const [events, setEvents] = useState([]);
  const [courseOptions, setcourseOptions] = useState([]); // 강의 옵션 상태

  // role 상태
  const [role, setType] = useState("");

  // course 상태
  const [course, setCourse] = useState("");

  useEffect(() => {
    // 페이지가 처음 로드될 때 API에서 데이터를 가져옵니다.
    fetchEvents();
    fetchcourses();
    const fetchRole = async () => {
      try {
        const token = localStorage.getItem("token"); // localStorage에서 token 가져오기
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!token) {
          console.log("No token found in localStorage");
          return;
        }
        // API 요청 보내기
        const role = localStorage.getItem("membertype");

        if (role !== "ROLE_ADMIN") {
          apiClient
            .get(`user/check/${userInfo.member.id}`)
            .then((response) => {
              setCourse(response.data); // 강의 목록 설정
              console.log(response.data);
            })
            .catch((error) => {
              console.error("강의 목록을 불러오지 못했습니다.", error);
            });
        }

        setType(role); // 받은 role을 상태로 저장
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchRole();
  }, []); // 빈 배열로 처음에 한 번만 실행

  const fetchEvents = () => {
    apiClient
      .get("schedule")
      .then((response) => {
        const fetchedEvents = response.data.map((event) => ({
          ...event,
          start: moment(event.startDate, "YYYY-MM-DD HH:mm").toDate(),
          end: moment(event.endDate, "YYYY-MM-DD HH:mm").toDate(),
        }));
        setEvents(fetchedEvents); // 3. 상태 업데이트
      })
      .catch((error) => {
        console.error("이벤트 데이터를 불러오지 못했습니다.", error);
      });
  };

  const fetchcourses = () => {
    // 강의 목록을 가져오는 API 호출
    apiClient
      .get("course/title")
      .then((response) => {
        setcourseOptions(response.data); // 강의 목록 설정
      })
      .catch((error) => {
        console.error("강의 목록을 불러오지 못했습니다.", error);
      });
  };

  // 일정 추가 핸들러
  const handleAddEvent = () => {
    setIsAddingEvent(true);
    setSelectedEvent(null);
    setOpen(true);
    setEditMode(true);
    setNewEventcourseTitle("");
    setNewEventEventTitle("");
    setNewEventDescription("");
    setNewEventStart(moment());
    setNewEventEnd(moment().add(1, "hour"));
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
    setIsAddingEvent(false);
    setEditMode(false);
    setNewEventcourseTitle("");
    setNewEventEventTitle("");
    setNewEventDescription("");
    setNewEventStart(moment());
    setNewEventEnd(moment().add(1, "hour"));
  };

  // 이벤트 클릭 시 이벤트 처리
  const handleSelectEvent = (event) => {
    console.log(event, "event");
    setSelectedEvent(event);
    setNewEventcourseTitle(event.courseTitle);
    setNewEventEventTitle(event.eventTitle);
    setNewEventDescription(event.description);
    setNewEventStart(moment(event.startDate));
    setNewEventEnd(moment(event.endDate));
    setIsAddingEvent(false);
    setOpen(true);
    setEditMode(false);
  };

  // 이벤트 수정 핸들러
  const handleEditEvent = () => {
    setEditMode(true);
  };

  // 이벤트 저장 핸들러
  const handleSaveEvent = () => {
    // 날짜 에러 메시지 띄우기
    if (newEventStart.isAfter(newEventEnd)) {
      setError("종료 날짜는 시작 날짜 이후여야 합니다.");
      return;
    }

    setError("");

    const newEvent = {
      id: selectedEvent ? selectedEvent.id : null,
      courseTitle: newEventcourseTitle,
      eventTitle: newEventEventTitle,
      description: newEventDescription,
      startDate: newEventStart.format("YYYY-MM-DD HH:mm"), // 포맷된 문자열로 변환
      endDate: newEventEnd.format("YYYY-MM-DD HH:mm"), // 포맷된 문자열로 변환
    };

    if (editMode) {
      if (isAddingEvent) {
        // 새로운 이벤트 추가
        apiClient
          .post("schedule", newEvent)
          .then((response) => {
            const savedEvent = {
              ...newEvent,
              id: response.data.id, // 서버에서 받은 id로 업데이트
              start: newEventStart.toDate(), // moment 객체를 JS Date 객체로 변환
              end: newEventEnd.toDate(), // moment 객체를 JS Date 객체로 변환
            };

            // 이벤트 목록에 새로 추가된 이벤트 반영
            setEvents([...events, savedEvent]);
            alert("일정이 추가되었습니다.");
            handleClose(); // 모달 닫기
            fetchEvents();
          })
          .catch((error) => {
            console.error("일정 추가에 실패하였습니다.", error);
          });
      } else {
        // 기존 이벤트 수정
        apiClient
          .put("schedule", newEvent)
          .then(() => {
            const updatedEvents = events.map((event) =>
              event.id === selectedEvent.id ? { ...event, ...newEvent } : event
            );
            setEvents(updatedEvents);
            alert("일정이 수정되었습니다.");
            handleClose(); // 모달 닫기
            fetchEvents();
          })
          .catch((error) => {
            console.error("일정 수정에 실패하였습니다.", error);
          });
      }
    }
  };

  // 이벤트 삭제 핸들러
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      apiClient
        .delete(`schedule/${selectedEvent.id}`)
        .then(() => {
          const filteredEvents = events.filter(
            (event) => event.id !== selectedEvent.id
          );
          setEvents(filteredEvents);
          alert("일정이 삭제되었습니다.");
          handleClose(); // 모달 닫기
          fetchEvents();
        })
        .catch((error) => {
          console.error("일정 삭제에 실패하였습니다.", error);
        });
    }
    handleClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div style={{ height: "80vh" }}>
        {!readOnly && role === "ROLE_ADMIN" ? (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleAddEvent}
            style={{ marginBottom: "10px" }}
          >
            일정 추가
          </Button>
        ) : (
          ""
        )}
        <Calendar
          localizer={localizer}
          events={events
            .filter((event) => {
              // 권한에 맞는 일정을 필터링
              // 예: 사용자 권한이 'admin'인 경우 모든 이벤트를 보여주고,
              // 권한이 'user'인 경우 특정 조건을 만족하는 이벤트만 보여주기
              if (role === "ROLE_ADMIN") {
                return true; // 'admin' 권한은 모든 일정 보여줌
              } else if (role === "ROLE_STUDENT" || role === "ROLE_TEACHER") {
                return (
                  event.courseTitle === course ||
                  event.courseTitle === "전체 일정"
                );
              }
              return false; // 기본적으로 권한이 없으면 이벤트를 안 보여줌
            })
            .map((event) => ({
              ...event,
              title: event.eventTitle,
            }))}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          onSelectEvent={handleSelectEvent}
          messages={messages} // 여기에 메시지 객체를 추가
        />

        <CustomModal
          isOpen={open}
          closeModal={handleClose}
          aria-label="model-courseTitle"
          aria-labelledby="modal-eventTitle"
          aria-describedby="modal-description"
        >
          <div
            style={{
              padding: "20px",
              background: "white",
              borderRadius: "8px",
              // maxWidth: "400px",
              // margin: "auto",
              top: "15%",
              position: "relative",
            }}
          >
            {editMode ? (
              <>
                <Typography
                  id="modal-eventTitle"
                  style={{ marginBottom: "16px", fontWeight: 600 }}
                >
                  {isAddingEvent ? "새 일정 추가" : "이벤트 수정"}
                </Typography>

                {/* 강의 드롭다운 */}
                <FormControl
                  fullWidth
                  style={{ marginBottom: "20px" }}
                  variant="outlined"
                >
                  <InputLabel>강의 </InputLabel>
                  <Select
                    label="강의"
                    value={newEventcourseTitle}
                    onChange={(e) => setNewEventcourseTitle(e.target.value)}
                  >
                    <MenuItem value="전체 일정">전체 일정</MenuItem>
                    {courseOptions.map((course, index) => (
                      <MenuItem key={index} value={course.courseTitle}>
                        {course.courseTitle}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="제목"
                  value={newEventEventTitle}
                  onChange={(e) => setNewEventEventTitle(e.target.value)}
                  style={{ marginBottom: "20px" }}
                />
                <TextField
                  fullWidth
                  label="설명"
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  style={{ marginBottom: "20px" }}
                  multiline // TextField를 textarea로 변경
                  rows={4} // 표시할 줄 수 (필요에 따라 조정 가능)
                />

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
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
                </Box>
                {error && (
                  <Typography
                    color="error"
                    variant="body2"
                    style={{
                      marginBottom: "20px",
                      marginTop: "12px",
                      marginLeft: "4px",
                    }}
                  >
                    {error}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #f6f8fa",
                    paddingBottom: "4px",
                    marginBottom: "2px",
                  }}
                >
                  <Typography id="modal-eventTitle" sx={{ fontWeight: 600 }}>
                    {selectedEvent ? selectedEvent.eventTitle : ""}
                  </Typography>

                  <Typography
                    id="modal-courseTitle"
                    sx={{
                      fontSize: "12px",
                      color: "darkgray",
                    }}
                  >
                    {selectedEvent ? selectedEvent.courseTitle : ""}
                  </Typography>
                </Box>
                <Box
                  sx={{ display: "flex", gap: "4px" }}
                  className="calendarModalDate"
                >
                  <Typography>
                    {" "}
                    {selectedEvent
                      ? moment(selectedEvent.start).format(
                          "YYYY년 MM월 DD일(ddd) HH:mm"
                        )
                      : ""}
                  </Typography>
                  <Typography sx={{ display: "inline", margin: "0px 2px" }}>
                    ~
                  </Typography>
                  <Typography>
                    {" "}
                    {selectedEvent
                      ? moment(selectedEvent.end).format(
                          "YYYY년 MM월 DD일(ddd) HH:mm"
                        )
                      : ""}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    marginTop: 2,
                    minHeight: "80px",
                  }}
                >
                  <Typography
                    id="modal-description"
                    style={{
                      fontSize: "14px",
                      whiteSpace: "pre-wrap", // 연속된 띄어쓰기 및 줄바꿈 모두 허용
                      overflow: "hidden", // 넘치는 내용 숨기기
                      textOverflow: "ellipsis", // 넘치는 내용에 ... 표시
                      display: "block", // 블록 요소로 설정
                      maxHeight: "200px", // 최대 높이 설정 (원하는 높이로 조정 가능)
                      overflowY: "auto", // 세로 방향 스크롤
                    }}
                  >
                    {selectedEvent ? selectedEvent.description : ""}
                  </Typography>
                </Box>

                {!readOnly && role === "ROLE_ADMIN" ? (
                  <div style={{ marginTop: "20px" }}>
                    <Button
                      variant="outlined"
                      onClick={handleEditEvent}
                      style={{ marginRight: "10px" }}
                    >
                      변경
                    </Button>
                    <Button variant="outlined" onClick={handleDeleteEvent}>
                      삭제
                    </Button>
                  </div>
                ) : (
                  ""
                )}
              </>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              {editMode && (
                <Button
                  onClick={handleSaveEvent}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  저장
                </Button>
              )}
              <Button onClick={handleClose} variant="outlined">
                닫기
              </Button>
            </Box>
          </div>
        </CustomModal>
      </div>
    </LocalizationProvider>
  );
};

export default Calendars;
