import React, { useState, useEffect } from 'react';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { Box, Button, Chip, IconButton, Input, Textarea } from '@mui/joy';
import { Modal } from "@mui/joy";
import { Select, Option, FormLabel } from '@mui/joy';
import List from '@mui/joy/List';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChatListItem from './ChatListItem';
import { toggleMessagesPane } from '../../utils/chat/utils';
import {useSelector} from "react-redux";

const ChatsPane = ({ chats, setSelectedChat, selectedChatId }) => {
  const [users, setUsers] = useState([]);
  const socket = useSelector((state) => state.socket.socket);

  useEffect(() => {
    // 서버에 courseId로 사용자 데이터 요청
    socket.emit('fetchChatUserData');

    // 서버에서 사용자 데이터 응답 받기
    socket.on('fetchedChatUserData', (studentData) => {
      setUsers(studentData);
    });

    // 클린업: 이벤트 리스너 제거
    return () => {
      socket.off('fetchedChatUserData');
    };
  }, []);

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [text, setText] = useState('');

  const modalOpen = () => {
    console.log("모달 열기 함수 호출됨");
    setSelectedUser('');
    setText('');
    setOpen(true);
    console.log("Last모달 열기 함수 호출됨");
  };

  const modalClose = () => {
    setOpen(false);
    setText('');
    setSelectedUser('');
  };

  const handleUserChange = (event, value) => {
    if (value) { // value가 null이 아닐 경우에만 처리
      setSelectedUser(value);
    }
  };

  const handleTextChange = (event) => {
      setText(event.target.value);
  }


  const handleSaveEvent = () => {
    console.log(`Selected user: ${selectedUser}`);
    console.log(`Text: ${text}`);

    socket.emit('createChat', { username: [selectedUser, localStorage.getItem("userId")], text: text }, (response) => {
      console.log(response);
    });

    modalClose();
  };


  return (
      <div>
        <Sheet
            sx={{
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white',
              height: { sm: 'calc(100dvh - var(--Header-height))', md: '88dvh' },
              overflowY: 'auto',
            }}
        >
          <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2, pb: 1.5 }}
          >
            <Typography
                component="h1"
                endDecorator={
                  <Chip
                      variant="soft"
                      color="primary"
                      size="md"
                      slotProps={{ root: { component: 'span' } }}
                  >
                    4
                  </Chip>
                }
                sx={{ fontSize: { xs: 'md', md: 'lg' }, fontWeight: 'lg', mr: 'auto' }}
            >
              Messages
            </Typography>
            <IconButton
                variant="plain"
                aria-label="edit"
                color="neutral"
                size="sm"
                sx={{ display: { xs: 'none', sm: 'unset' } }}
                onClick={modalOpen}
            >
              <EditNoteRoundedIcon />
            </IconButton>

            <IconButton
                variant="plain"
                aria-label="edit"
                color="neutral"
                size="sm"
                onClick={() => {
                  toggleMessagesPane();
                }}
                sx={{ display: { sm: 'none' } }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Input
                size="sm"
                startDecorator={<SearchRoundedIcon />}
                placeholder="Search"
                aria-label="Search"
            />
          </Box>
          <List
              sx={{
                py: 0,
                '--ListItem-paddingY': '0.75rem',
                '--ListItem-paddingX': '1rem',
              }}
          >
            {chats.map((chat) => (
                <ChatListItem
                    key={chat.id}
                    {...chat}
                    setSelectedChat={setSelectedChat}
                    selectedChatId={selectedChatId}
                />
            ))}
          </List>
        </Sheet>


        <Modal
            open={open}
            onClose={modalClose}
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
                minWidth: "600px",
                maxWidth: "600px",
                minHeight: "250px",
                maxHeight: "250px",
                margin: "auto",
                position: "absolute",
                top: "30%",
                left: "50%",
                transform: "translate(-50%, -50%)", // 중앙 정렬
                zIndex: 1500, // 모달의 z-index를 높임
              }}
          >
            <Typography id="modal-title" variant="h6">
              채팅 회원 추가
            </Typography>
            <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mt: 2,
                  overflowY: "auto", // 내용이 넘칠 경우 스크롤 처리
                  maxHeight: "200px", // 최대 높이 설정
                }}
            >
              <Box sx={{
                mb: 2

              }}>
                <FormLabel>회원 목록</FormLabel>
                <Select
                    placeholder="회원 목록을 선택하세요"
                    value={selectedUser}
                    onChange={handleUserChange}
                >
                  {users.map((user) => (
                      <Option key={user.username} value={user.id}>
                        {user.name}
                      </Option>
                  ))}
                </Select>
                <br></br>
                {selectedUser ? (
                    <Textarea
                        placeholder='첫 메시지를 입력해 주세요.'
                        value={text}
                        onChange={handleTextChange}
                    />
                ) : (
                    <div />
                )}
              </Box>

              <Box sx={{
                display: "flex", justifyContent: "flex-end", mt: 2, position: "absolute", bottom: 30, right: 60
              }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={handleSaveEvent}>
                    추가
                  </Button>
                  <Button variant="outlined" onClick={modalClose}>
                    취소
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Modal>


      </div>
  );
};
export default ChatsPane;