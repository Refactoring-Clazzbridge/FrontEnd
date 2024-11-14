import React, { useEffect, useState } from "react";
import dompurify from "dompurify";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { checkSubmission } from "../../services/apis/submission/get"; // checkSubmission API import
import { submitAssignment } from "../../services/apis/submission/post";
import { getStudentsByCourseId } from "../../services/apis/course/get";
import CustomSnackbar from "../common/CustomSnackbar";
import { Box, List, ListItem } from "@mui/material";
import ReactQuill from "react-quill";
import hljs from "highlight.js";
import { deleteAssignment } from "../../services/apis/assignment/delete";
import CustomModal from "../../components/common/CustomModal";
import "react-quill/dist/quill.snow.css";
import "highlight.js/styles/github.css";
import "../../styles/assignment.css";

const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, false] }],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["bold", "italic", "underline"],
      ["link", "image"],
      ["code-block"],
      ["clean"],
    ],
  },
  syntax: {
    highlight: (text) => hljs.highlightAuto(text).value,
  },
};

export default function AssignmentItem({
  currentUser,
  courseId,
  studentCourseId,
  fetchAssignments,
  assignments, // assignments의 기본값을 빈 배열로 설정
}) {
  const [submissions, setSubmissions] = useState([]); // 초기값은 빈 배열
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [students, setStudents] = useState([]); // 수강생 리스트 상태
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null); // 삭제할 과제 ID 저장
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false); // 강사용 제출 내용 확인 모달
  const [submissionStudent, setSubmissionStudent] = useState(""); // 제출 내용 저장

  const openDeleteModal = (assignmentId) => {
    setAssignmentToDelete(assignmentId);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setAssignmentToDelete(null);
  };

  const openSubmissionModal = (student) => {
    setSubmissionStudent(student);
    setIsSubmissionModalOpen(true);
  };

  const closeSubmissionModal = () => {
    setIsSubmissionModalOpen(false);
    setSubmissionStudent(null);
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (currentUser) {
        if (currentUser.member.memberType === "ROLE_STUDENT") {
          // 학생인 경우 자신의 제출 상태 가져오기
          try {
            const submissionResults = await Promise.all(
              assignments.map((assignment) => {
                return checkSubmission(
                  assignment.assignmentId,
                  studentCourseId
                );
              })
            );
            const newSubmissions = submissionResults.map((result, index) => {
              if (!result) {
                console.log(
                  `No result for assignment ID: ${assignments[index].assignmentId}`
                );
                return { text: "", submitted: false };
              }
              return {
                text: result.content || "",
                submitted: result.submitted,
                submissionDate: result.submissionDate,
              };
            });
            setSubmissions(newSubmissions);
          } catch (error) {
            showSnackbar("제출 상태를 가져오는 데 실패했습니다.", "error");
          }
        }
      }
    };

    if (assignments.length > 0 || currentUser) {
      fetchSubmissions();
    }
  }, [assignments, studentCourseId, currentUser]); // assignments, studentCourseId, currentUser가 변경될 때만 실행

  useEffect(() => {
    const fetchStudents = async () => {
      if (
        currentUser &&
        currentUser.member &&
        currentUser.member.memberType === "ROLE_TEACHER"
      ) {
        try {
          const allStudents = await Promise.all(
            assignments.map(async (assignment) => {
              const response = await getStudentsByCourseId(
                assignment.assignmentId
              );
              console.log(response, "response");
              return {
                assignmentId: assignment.assignmentId,
                students: response,
              };
            })
          );
          setStudents(allStudents);
        } catch (error) {
          console.error("수강생 리스트를 불러오는 데 실패했습니다.", error);
        }
      }
    };
    fetchStudents();
  }, [currentUser, studentCourseId, assignments]);

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleSubmissionChange = (index, value) => {
    if (submissions[index]) {
      const newSubmissions = [...submissions];
      newSubmissions[index].text = value;
      setSubmissions(newSubmissions);
    } else {
      console.error(`Submission at index ${index} is undefined.`);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSubmit = async (index) => {
    const { text } = submissions[index] || {};
    if (text) {
      const formData = new FormData();
      formData.append("assignmentId", assignments[index].assignmentId);
      formData.append("studentCourseId", studentCourseId);
      formData.append("content", text);

      try {
        await submitAssignment(formData);
        const newSubmissions = [...submissions];
        newSubmissions[index] = { text, submitted: true };
        setSubmissions(newSubmissions);
        showSnackbar("과제가 성공적으로 제출되었습니다!", "success");
      } catch (error) {
        console.error("과제 제출 중 오류 발생", error);
        showSnackbar("과제 제출이 실패했습니다.", "error");
      }
    }
  };

  const handleDelete = async () => {
    if (assignmentToDelete) {
      try {
        await deleteAssignment(assignmentToDelete); // API 호출로 삭제
        showSnackbar("과제가 삭제되었습니다.", "success");
        closeDeleteModal(); // 모달 닫기
        setAssignmentToDelete(null);
        await fetchAssignments();
      } catch (error) {
        console.error("과제 삭제 중 오류 발생", error);
        showSnackbar("과제 삭제에 실패했습니다.", "error");
        setAssignmentToDelete(null);
      }
    }
  };

  const getDaysRemaining = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const timeDiff = due - today;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  const sanitizer = dompurify.sanitize;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {assignments.length > 0 ? (
        assignments.map((assignment, index) => {
          const daysRemaining = getDaysRemaining(assignment.dueDate);
          const submission = submissions[index] || {};
          const isPastDue = daysRemaining < 0;
          const assignmentStudents =
            students.find(
              (studentGroup) =>
                studentGroup.assignmentId === assignment.assignmentId
            )?.students || [];

          return (
            <Accordion key={assignment.assignmentId}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${assignment.assignmentId}-content`}
                id={`panel${assignment.assignmentId}-header`}
                sx={{ backgroundColor: "#f6f8fa" }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 600, marginBottom: 1 }}>
                    {assignment.title}
                    {currentUser &&
                      currentUser.member &&
                      currentUser.member.memberType === "ROLE_ADMIN" && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "gray",
                            marginLeft: "8px",
                            fontWeight: 500,
                          }}
                        >
                          {assignment.courseName}
                        </span>
                      )}
                  </Typography>
                  <Typography sx={{ fontSize: "12px" }}>
                    마감 날짜: {assignment.dueDate}
                    <Typography
                      component="span"
                      sx={{
                        marginLeft: 1,
                        fontSize: "12px",
                        display: "inline",
                        color: "darkred",
                      }}
                    >
                      {daysRemaining > 0
                        ? `${daysRemaining}일 남았습니다 🔥`
                        : daysRemaining === 0
                          ? "마감 당일입니다 🧨"
                          : "마감 완료"}
                    </Typography>
                  </Typography>
                </Box>
                {currentUser &&
                  currentUser.member &&
                  currentUser.member.memberType === "ROLE_STUDENT" && (
                    <>
                      {submission.submitted ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "auto",
                            marginRight: "16px",
                          }}
                        >
                          <CheckCircleIcon
                            sx={{ color: "darkgreen", marginRight: "4px" }}
                          />
                          <Typography sx={{ color: "darkgreen" }}>
                            제출 완료
                          </Typography>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "auto",
                            marginRight: "16px",
                          }}
                        >
                          <CancelIcon
                            sx={{ color: "brown", marginRight: "4px" }}
                          />
                          <Typography sx={{ color: "brown" }}>
                            미제출
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  className="assignmentImage"
                  style={{ margin: "16px 0px" }}
                  dangerouslySetInnerHTML={{
                    __html: sanitizer(`${assignment.description}`),
                  }}
                />
                {currentUser &&
                  currentUser.member &&
                  currentUser.member.memberType === "ROLE_STUDENT" &&
                  !submission.submitted && (
                    <ReactQuill
                      theme="snow"
                      value={submission.text}
                      onChange={(value) => handleSubmissionChange(index, value)}
                      modules={modules}
                      style={{ width: "100%" }}
                    />
                  )}
                {currentUser &&
                  currentUser.member &&
                  currentUser.member.memberType === "ROLE_STUDENT" &&
                  submission.submitted && (
                    <>
                      <Typography
                        className="submissionImage"
                        dangerouslySetInnerHTML={{
                          __html: sanitizer(`${submission.text}`),
                        }}
                        sx={{
                          borderTop: "1px solid #e0e0e0",
                          whiteSpace: "pre-wrap",
                        }}
                      />
                      <Typography
                        sx={{
                          paddingTop: 2,
                          fontSize: "12px",
                        }}
                      >
                        제출 날짜: {submission.submissionDate}
                      </Typography>
                    </>
                  )}
                {currentUser &&
                  currentUser.member &&
                  currentUser.member.memberType === "ROLE_STUDENT" && (
                    <AccordionActions sx={{ padding: 0 }}>
                      <Button
                        onClick={() => handleSubmit(index)}
                        disabled={
                          submission.submitted || isPastDue || !submission.text
                        }
                        variant="contained"
                      >
                        제출
                      </Button>
                    </AccordionActions>
                  )}
                {currentUser &&
                  currentUser.member &&
                  currentUser.member.memberType === "ROLE_TEACHER" && (
                    <Box sx={{ borderTop: "1px solid #e0e0e0" }}>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          marginTop: 1,
                          marginBottom: "2px",
                        }}
                      >
                        총 수강생 수: {assignmentStudents.length}명
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "gray",
                          marginBottom: 1,
                        }}
                      >
                        수강생 이름을 클릭해 제출 내용을 확인해보세요!
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "50%",
                          marginBottom: 2,
                        }}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            marginRight: 2,
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "14px",
                              color: "darkgreen",
                            }}
                          >
                            제출 완료 (
                            {
                              assignmentStudents.filter(
                                (student) => student.submitted
                              ).length
                            }
                            명)
                          </Typography>
                          <List sx={{ maxHeight: 150, overflowY: "auto" }}>
                            {assignmentStudents
                              .filter((student) => student.submitted)
                              .map((student, subIndex) => (
                                <ListItem
                                  key={subIndex}
                                  sx={{ paddingLeft: 0 }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <img
                                      src={student.avatarImage} // 프로필 사진 URL
                                      alt={`${student.name}'s profile`}
                                      style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: "50%",
                                        marginRight: 8,
                                      }}
                                    />
                                    <Typography
                                      onClick={() =>
                                        openSubmissionModal(student)
                                      }
                                      sx={{
                                        fontWeight: 600,
                                        cursor: "pointer",
                                      }}
                                    >
                                      {student.name}
                                    </Typography>
                                  </Box>
                                </ListItem>
                              ))}
                          </List>
                        </Box>

                        <Box
                          sx={{
                            flex: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "14px",
                              color: "darkred",
                            }}
                          >
                            미제출 (
                            {
                              assignmentStudents.filter(
                                (student) => !student.submitted
                              ).length
                            }
                            명)
                          </Typography>
                          <List
                            sx={{
                              maxHeight: 150,
                              overflowY: "auto",
                            }}
                          >
                            {assignmentStudents
                              .filter((student) => !student.submitted)
                              .map((student, subIndex) => (
                                <ListItem
                                  key={subIndex}
                                  sx={{ paddingLeft: 0 }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <img
                                      src={student.avatarImage} // 프로필 사진 URL
                                      alt={`${student.name}'s profile`}
                                      style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: "50%",
                                        marginRight: 8,
                                      }}
                                    />
                                    <Typography>{student.name}</Typography>
                                  </Box>
                                </ListItem>
                              ))}
                          </List>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          onClick={() =>
                            openDeleteModal(assignment.assignmentId)
                          }
                          variant="outlined"
                          color="error"
                        >
                          삭제
                        </Button>
                      </Box>
                    </Box>
                  )}
              </AccordionDetails>
            </Accordion>
          );
        })
      ) : (
        <Typography>과제가 없습니다.</Typography> // 과제가 없을 때 메시지 표시
      )}
      <CustomSnackbar
        open={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleCloseSnackbar}
      />

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
          <h3>과제 삭제하기</h3>
          <p>해당 과제를 삭제하시겠습니까?</p>

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
                handleDelete(assignmentToDelete);
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

      <CustomModal
        isOpen={isSubmissionModalOpen}
        closeModal={closeSubmissionModal}
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
          <h3>
            {submissionStudent ? submissionStudent.name : ""}님의 제출 내용
          </h3>
          <Box
            sx={{
              width: "100%",
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              padding: 2,
              whiteSpace: "pre-wrap",
            }}
          >
            <Typography
              dangerouslySetInnerHTML={{
                __html: sanitizer(
                  `${submissionStudent ? submissionStudent.content : ""}`
                ),
              }}
            ></Typography>
          </Box>
          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
          >
            <Typography sx={{ fontSize: "12px", color: "gray" }}>
              제출 날짜:{" "}
              {submissionStudent ? submissionStudent.submissionDate : ""}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={closeSubmissionModal}
            sx={{
              width: "120px",
              height: "40px",
              borderColor: "#34495e",
              color: "#34495e",
            }}
          >
            닫기
          </Button>
        </Box>
      </CustomModal>
    </Box>
  );
}
