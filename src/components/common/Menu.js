import { React, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CustomModal from "./CustomModal";
import { Box, Button } from "@mui/material";

const ITEM_HEIGHT = 48;

export default function LongMenu({
  commentId,
  commentContent,
  onEdit,
  onDelete,
  isAdmin, // 관리자인지 여부를 나타내는 prop 추가
  isAuthor,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false); // 모달 상태 추가
  const [selectedCommentId, setSelectedCommentId] = useState(null); // 선택된 댓글 ID 상태 추가

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = (id) => {
    setSelectedCommentId(id); // 선택된 댓글 ID 저장
    setOpenModal(true); // 삭제 클릭 시 모달 열기
    handleClose(); // 메뉴 닫기
  };

  const handleModalClose = () => {
    setOpenModal(false); // 모달 닫기
    setSelectedCommentId(null); // 선택된 댓글 ID 초기화
  };

  const deleteComments = async () => {
    if (selectedCommentId) {
      await onDelete(selectedCommentId); // 댓글 삭제 호출
      handleModalClose(); // 모달 닫기
    }
  };

  const options = isAdmin && !isAuthor ? ["삭제"] : ["수정", "삭제"];

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: "20ch",
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            onClick={
              option === "삭제"
                ? () => handleDeleteClick(commentId)
                : () => {
                    onEdit(commentId, commentContent); // 수정 클릭 시 onEdit 호출
                    handleClose();
                  }
            }
          >
            {option}
          </MenuItem>
        ))}
      </Menu>

      {/* 삭제 모달 */}
      <CustomModal isOpen={openModal} closeModal={handleModalClose}>
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
          <h3>댓글 삭제</h3>
          <p>댓글을 완전히 삭제할까요?</p>

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
              onClick={handleModalClose}
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
              onClick={deleteComments}
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
