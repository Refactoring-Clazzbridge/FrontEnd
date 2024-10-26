import React, { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { getAssignmentsByCourseId } from "../../services/apis/assignment/get";
import { submitAssignment } from "../../services/apis/assignment/submit"; // 제출 API 호출 임포트

export default function AssignmentItem({ courseId }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const fetchedAssignments = await getAssignmentsByCourseId(courseId);
        setAssignments(fetchedAssignments);
        setSubmissions(
          fetchedAssignments.map(() => ({
            text: "",
            submitted: false,
            file: null,
          }))
        );
      } catch (error) {
        console.error("과제 목록을 가져오는 데 오류가 발생했습니다.", error);
      }
    };

    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  const handleSubmissionChange = (index, value) => {
    const newSubmissions = [...submissions];
    newSubmissions[index].text = value;
    setSubmissions(newSubmissions);
  };

  const handleFileChange = (index, file) => {
    const newSubmissions = [...submissions];
    newSubmissions[index].file = file;
    setSubmissions(newSubmissions);
  };

  const handleSubmit = async (index) => {
    const { text, file } = submissions[index];
    if (text || file) {
      const formData = new FormData();
      formData.append("assignmentId", assignments[index].id);
      formData.append("studentCourseId" /* 현재 학생의 수강 ID */);
      formData.append("content", text);
      if (file) {
        formData.append("file", file);
      }

      try {
        // 파일과 함께 제출 요청을 보낼 API 호출 필요
        await submitAssignment(formData);
        const newSubmissions = [...submissions];
        newSubmissions[index].submitted = true;
        setSubmissions(newSubmissions);
        alert("과제가 성공적으로 제출되었습니다!");
      } catch (error) {
        console.error("과제 제출 중 오류 발생", error);
      }
    }
  };

  return (
    <div>
      {assignments.map((assignment, index) => (
        <Accordion key={assignment.id}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${assignment.id}-content`}
            id={`panel${assignment.id}-header`}
          >
            <Typography>{assignment.title}</Typography>

            {/* 제출 상태 텍스트 및 아이콘 표시 */}
            {submissions[index].submitted ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: "auto",
                }}
              >
                <CheckCircleIcon sx={{ color: "green", marginRight: "4px" }} />
                <Typography sx={{ color: "green" }}>제출 완료</Typography>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: "auto",
                }}
              >
                <CancelIcon sx={{ color: "red", marginRight: "4px" }} />
                <Typography sx={{ color: "red" }}>미제출</Typography>
              </div>
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{assignment.details}</Typography>

            {/* 과제 제출을 위한 입력 필드 */}
            <TextField
              label="과제를 제출하세요"
              fullWidth
              multiline
              minRows={3}
              value={submissions[index].text}
              onChange={(e) => handleSubmissionChange(index, e.target.value)}
              sx={{ marginTop: "16px" }}
            />

            {/* 파일 업로드 입력 필드 */}
            <input
              type="file"
              onChange={(e) => handleFileChange(index, e.target.files[0])}
              style={{ marginTop: "16px" }}
            />
          </AccordionDetails>
          <AccordionActions>
            <Button
              onClick={() => handleSubmit(index)}
              disabled={
                submissions[index].submitted ||
                (!submissions[index].text && !submissions[index].file)
              }
              variant="contained"
            >
              제출
            </Button>
          </AccordionActions>
        </Accordion>
      ))}
    </div>
  );
}
