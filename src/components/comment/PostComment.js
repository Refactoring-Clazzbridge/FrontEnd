import React, { useState, useEffect, useRef } from "react";
import { Box, Button, TextField, Typography, Avatar } from "@mui/material";
import Menu from "../../components/common/Menu";
// api
import { getCommentByPost } from "../../services/apis/comment/get";
import { saveComment } from "../../services/apis/comment/post";
import { updateComment } from "../../services/apis/comment/put";
import { deleteComment } from "../../services/apis/comment/delete";
// custom
import CustomSnackbar from "../../components/common/CustomSnackbar"; // 커스텀 스낵바

export default function PostComment({ postId }) {
  const [comments, setComments] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null); // 수정할 댓글 ID
  const [editContent, setEditContent] = useState(""); // 수정할 댓글 내용
  const textFieldRef = useRef(null);

  const [openSnackbar, setOpenSnackbar] = useState(false); // 스낵바 열기 상태
  const [snackbarMessage, setSnackbarMessage] = useState(""); // 스낵바 메시지
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 스낵바 성공/실패 유무

  const fetchComments = async () => {
    try {
      const fetchedComments = await getCommentByPost(postId);
      setComments(fetchedComments);
      console.log(fetchedComments);
    } catch (error) {
      console.error("댓글을 불러오는 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    if (editCommentId) {
      textFieldRef.current.focus(); // 수정 모드일 때 TextField에 포커스
      setTimeout(() => {
        // 포커스 후 커서를 텍스트의 끝으로 이동
        const input = textFieldRef.current;
        input.setSelectionRange(input.value.length, input.value.length);
      }, 0);
    }
  }, [editCommentId]); // editCommentId가 변경될 때마다 실행

  const handleCommentSubmit = async () => {
    if (editCommentId) {
      // 수정 모드
      if (newComment.trim() !== "") {
        setSnackbarMessage("댓글 수정 후 작성해 주세요.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return; // 댓글 내용이 비어있으면 아무 작업도 하지 않음
      }
      if (editContent.trim() === "") {
        setSnackbarMessage("수정 댓글을 작성해 주세요.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return; // 댓글 내용이 비어있으면 아무 작업도 하지 않음
      }
      try {
        const updatedComment = {
          id: editCommentId,
          postId,
          comment: editContent,
        };
        console.log(updateComment);
        await updateComment(updatedComment); // 수정 API 호출
        setEditCommentId(null); // 수정 모드 종료
        setEditContent(""); // 입력 필드 초기화
        setSnackbarMessage("댓글이 수정되었습니다.");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        await fetchComments(); // 댓글 목록 새로 고침
      } catch (error) {
        console.error("댓글 수정 실패:", error);
        setSnackbarMessage("댓글 수정에 실패했습니다.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } else {
      // 새 댓글 추가
      try {
        const commentRequestDTO = {
          content: newComment,
          postId: postId,
        };
        await saveComment(commentRequestDTO);
        setNewComment("");
        setSnackbarMessage("댓글이 작성되었습니다.");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        await fetchComments();
      } catch (error) {
        console.log("댓글 작성 실패", error);
        setSnackbarMessage("댓글 작성이 실패했습니다.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId); // 댓글 삭제 API 호출
      setSnackbarMessage("댓글이 삭제되었습니다."); // 스낵바 메시지 설정
      setSnackbarSeverity("success"); // 성공 스낵바
      setOpenSnackbar(true); // 스낵바 열기
      await fetchComments(); // 댓글 목록 새로 고침
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      setSnackbarMessage("댓글 삭제에 실패했습니다."); // 실패 메시지 설정
      setSnackbarSeverity("error"); // 실패 스낵바
      setOpenSnackbar(true); // 스낵바 열기
    }
  };

  const getUserInfo = () => {
    try {
      const userInfoString = localStorage.getItem("userInfo");

      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        console.log(userInfo, "userinfo");
        return userInfo;
      }

      return null;
    } catch (error) {
      console.error("사용자 정보를 가져오는 중 오류 발생:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchedUserInfo = getUserInfo();
    setUserInfo(fetchedUserInfo);
  }, []);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) {
      return "지금";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInDays < 30) {
      return `${diffInDays}일 전`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths}개월 전`;
    } else if (diffInYears < 10) {
      return `${diffInYears}년 전`;
    } else {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}. ${month}. ${day}`;
    }
  };

  const handleEdit = (id, content) => {
    setEditCommentId(id); // 수정할 댓글 ID 설정
    setEditContent(content); // 수정할 댓글 내용 설정
  };

  const handleInput = (event) => {
    // 입력 내용에 따라 높이를 자동으로 조정
    event.target.style.height = "auto"; // 높이를 초기화
    event.target.style.height = `${event.target.scrollHeight}px`; // 내용에 맞게 높이 조정
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // 스낵바 닫기
  };

  return (
    <>
      <Typography
        sx={{
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        댓글 {comments.length}개
      </Typography>

      <Box
        sx={{
          width: "100%", // Box의 너비 설정
          display: "flex",
          margin: "18px 0",
          overflow: "hidden", // Box 밖으로 나가지 않도록 설정
        }}
      >
        {userInfo && (
          <>
            <Avatar
              alt={userInfo.member?.name || "User"}
              src={
                userInfo.member?.profileImageUrl ||
                "/static/images/avatar/1.jpg"
              }
            />
          </>
        )}
        <Box className="textBox" sx={{ width: "100%" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onInput={handleInput} // 입력 시 높이 조정
            onChange={(e) => setNewComment(e.target.value)}
            multiline
            minRows={1}
            maxRows={Infinity}
            sx={{
              margin: "0px 1px",
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                {
                  border: "none",
                },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  border: "none",
                },
              "& .MuiInputBase-root": {
                padding: "8px 14px",
                display: "flex",
                whiteSpace: "pre-wrap", // 줄바꿈을 유지
                alignItems: "flex-start", // 텍스트가 위쪽에서 시작하도록 설정
                overflowY: "hidden", // 스크롤이 생기지 않게 설정
              },
              "& textarea": {
                lineHeight: "1.5",
                overflow: "hidden", // 스크롤 숨기기
                minHeight: "48px",
                height: "auto", // 자동으로 높이 조절
                boxSizing: "border-box", // padding과 border 고려하여 크기 계산
              },
              "& .MuiInputBase-input": {
                display: "flex",
                alignItems: "flex-start", // 텍스트가 상단에서 시작하도록 설정
                height: "auto", // 자동 높이 조정
                whiteSpace: "pre-wrap", // 줄바꿈을 유지
                textAlign: "left", // 텍스트를 왼쪽 정렬
              },
            }}
          />
        </Box>
        <Button
          variant="contained"
          onClick={handleCommentSubmit}
          disabled={!newComment.trim()}
          sx={{
            backgroundColor: "#34495e",
            maxHeight: "40px",
          }}
        >
          작성
        </Button>
      </Box>

      <Box
        className="comments-container"
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {comments.length > 0 && (
          <Box className="comments-list" sx={{ width: "100%" }}>
            {comments.map((comment) => (
              <Box
                key={comment.id}
                className="comment-item"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: "28px",
                }}
              >
                <Box
                  sx={{ display: "flex", flexDirection: "row", width: "100%" }}
                >
                  <Avatar
                    alt={comment?.author || "User"}
                    src={
                      comment?.profileImageUrl || "/static/images/avatar/1.jpg"
                    }
                    sx={{ marginRight: 1.5 }}
                  />
                  <Box sx={{ width: "100%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Typography
                        className="comment-author"
                        sx={{
                          fontSize: "13px",
                          fontWeight: 600,
                          marginRight: 1,
                        }}
                      >
                        {comment.author}
                      </Typography>
                      <Box>
                        <Typography
                          className="comment-date"
                          sx={{ fontSize: "12px", color: "gray" }}
                        >
                          {formatRelativeTime(comment.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                    {/* 댓글 내용 */}
                    {editCommentId === comment.id ? (
                      <Box
                        className="menuBtnBox"
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "end",
                          width: "100%",
                          marginTop: "8px",
                        }}
                      >
                        <Box
                          className="editField"
                          sx={{
                            width: "100%",
                            display: "flex",
                            marginBottom: 1,
                          }}
                        >
                          <TextField
                            fullWidth
                            variant="outlined"
                            inputRef={textFieldRef} // ref를 TextField에 연결
                            placeholder="댓글을 수정하세요..."
                            value={editContent}
                            onInput={handleInput} // 입력 시 높이 조정
                            onChange={(e) => setEditContent(e.target.value)} // 수정할 내용 업데이트
                            multiline
                            minRows={1}
                            maxRows={Infinity}
                            sx={{
                              flexGrow: 1,
                              marginRight: "8px",
                              // margin: "0px 1px",
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                              },
                              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                                {
                                  border: "none",
                                },
                              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  border: "none",
                                },
                              "& .MuiInputBase-root": {
                                padding: 0,
                                display: "flex",
                                whiteSpace: "pre-wrap", // 줄바꿈을 유지
                                alignItems: "flex-start", // 텍스트가 위쪽에서 시작하도록 설정
                                overflowY: "hidden", // 스크롤이 생기지 않게 설정
                              },
                              "& textarea": {
                                lineHeight: "1.5",
                                overflow: "hidden", // 스크롤 숨기기
                                minHeight: "48px",
                                height: "auto", // 자동으로 높이 조절
                                boxSizing: "border-box", // padding과 border 고려하여 크기 계산
                              },
                              "& .MuiInputBase-input": {
                                display: "flex",
                                alignItems: "flex-start", // 텍스트가 상단에서 시작하도록 설정
                                height: "auto", // 자동 높이 조정
                                whiteSpace: "pre-wrap", // 줄바꿈을 유지
                                textAlign: "left", // 텍스트를 왼쪽 정렬
                              },
                            }}
                          />
                        </Box>
                        <Box className="menuBtnMain" sx={{ display: "flex" }}>
                          <Button
                            variant="contained"
                            onClick={handleCommentSubmit}
                            sx={{
                              backgroundColor: "#34495e",
                              fontWeight: 600,
                            }}
                          >
                            수정
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setEditCommentId(null); // 수정 모드 종료
                              setEditContent(""); // 입력 필드 초기화
                            }}
                            sx={{
                              marginLeft: "8px",
                            }}
                          >
                            취소
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography
                        className="comment-content"
                        sx={{ fontSize: "14px", whiteSpace: "pre-wrap" }}
                      >
                        {comment.content}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* 댓글 우측 수정/삭제 메뉴바 시작 */}
                <Box>
                  {userInfo && // 본인 댓글이거나 관리자인 경우 메뉴 아이콘 표시
                    (userInfo.member?.id === comment.authorId ||
                    userInfo.member?.memberType === "ROLE_ADMIN" ? (
                      <Menu
                        commentId={comment.id}
                        commentContent={comment.content} // 댓글 내용 전달
                        onEdit={handleEdit}
                        onDelete={handleDeleteComment} // 삭제 핸들러 전달
                        isAdmin={userInfo.member?.memberType === "ROLE_ADMIN"} // 관리자 여부 전달
                        isAuthor={comment.authorId === userInfo.member.id}
                      />
                    ) : null)}
                </Box>
                {/* 댓글 우측 수정/삭제 메뉴바 끝 */}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* 커스텀 스낵바 */}
      <CustomSnackbar
        open={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleCloseSnackbar}
      />
    </>
  );
}
