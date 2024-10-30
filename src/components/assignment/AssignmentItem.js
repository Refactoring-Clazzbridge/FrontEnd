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
import CustomSnackbar from "../common/CustomSnackbar";
import { Box } from "@mui/material";
import ReactQuill from "react-quill";
import hljs from "highlight.js";
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
  studentCourseId,
  assignments = [], // assignments의 기본값을 빈 배열로 설정
}) {
  const [submissions, setSubmissions] = useState([]); // 초기값은 빈 배열
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    // assignments가 변경될 때마다 submissions 업데이트
    const fetchSubmissions = async () => {
      try {
        const submissionResults = await Promise.all(
          assignments.map((assignment) => {
            console.log("Assignment ID:", assignment.assignmentId);
            console.log("Student Course ID:", studentCourseId);
            console.log(assignment, "assignment");
            return checkSubmission(assignment.assignmentId, studentCourseId);
          })
        );
        // submissions 배열을 assignments의 길이에 맞게 초기화
        const newSubmissions = submissionResults.map((result, index) => {
          // API 호출 결과가 undefined인 경우 기본값 설정
          console.log(result, "result");
          if (!result) {
            console.warn(
              `No result for assignment ID: ${assignments[index].assignmentId}`
            );
            return { text: "", submitted: false };
          }
          return {
            text: result.content || "", // API에서 가져온 내용
            submitted: result.submitted, // 제출 여부
            submissionDate: result.submissionDate,
          };
        });

        setSubmissions(newSubmissions);
      } catch (error) {
        showSnackbar("제출 상태를 가져오는 데 실패했습니다.", "error");
      }
    };

    if (assignments.length > 0) {
      fetchSubmissions();
    }
  }, [assignments, studentCourseId]); // assignments와 studentCourseId가 변경될 때만 실행

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleSubmissionChange = (index, value) => {
    // 입력된 값을 로그로 출력
    console.log(`Input for assignment ${index}:`, value);

    // submissions 배열이 올바르게 초기화되었는지 확인
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
    const { text } = submissions[index] || {}; // 안전하게 접근하기 위해 기본값 설정
    if (text) {
      const formData = new FormData();
      formData.append("assignmentId", assignments[index].assignmentId);
      formData.append("studentCourseId", studentCourseId);
      formData.append("content", text);

      try {
        await submitAssignment(formData);
        const newSubmissions = [...submissions];
        newSubmissions[index] = { text, submitted: true }; // 제출 후 업데이트
        setSubmissions(newSubmissions);
        showSnackbar("과제가 성공적으로 제출되었습니다!", "success");
      } catch (error) {
        console.error("과제 제출 중 오류 발생", error);
        showSnackbar("과제 제출이 실패했습니다.", "error");
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
      {assignments.length > 0 ? ( // assignments가 있을 때만 렌더링
        assignments.map((assignment, index) => {
          const daysRemaining = getDaysRemaining(assignment.dueDate);
          const submission = submissions[index] || {}; // 안전하게 접근하기 위해 기본값 설정
          const isPastDue = daysRemaining < 0; // 마감 날짜가 지났는지 확인
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
                      {daysRemaining >= 0
                        ? `${daysRemaining}일 남았습니다 🔥`
                        : "마감 완료"}
                    </Typography>
                  </Typography>
                </Box>
                {currentUser.member.memberType === "ROLE_STUDENT" && (
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
                        <Typography sx={{ color: "brown" }}>미제출</Typography>
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
                {currentUser.member.memberType === "ROLE_STUDENT" &&
                  !submission.submitted && (
                    <ReactQuill
                      theme="snow"
                      value={submission.text}
                      onChange={(value) => handleSubmissionChange(index, value)}
                      modules={modules}
                      style={{ width: "100%" }}
                    />
                  )}
                {currentUser.member.memberType === "ROLE_STUDENT" &&
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
                {currentUser.member.memberType === "ROLE_STUDENT" && (
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
                {currentUser.member.memberType === "ROLE_TEACHER" && (
                  <Box sx={{ borderTop: "1px solid #e0e0e0", paddingTop: 2 }}>
                    <Typography>제출 상태:</Typography>
                    {submissions.map((submission, subIndex) => (
                      <Typography key={subIndex}>
                        학생 {subIndex + 1}:{" "}
                        {submission.submitted ? "제출 완료" : "미제출"}
                      </Typography>
                    ))}
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
    </Box>
  );
}
