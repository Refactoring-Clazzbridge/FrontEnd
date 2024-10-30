import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import '../../styles/Chat.css'
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';

const socket = io('default-websocket-servic-3b8f6-100169772-9abcce8b6147.kr.lb.naverncp.com:3001').emit('connected', localStorage.getItem('token'));

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // 서버에서 채팅 메시지를 수신할 때마다 실행
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // 컴포넌트 언마운트 시 소켓 이벤트 해제
    return () => {
      socket.off('chat message');
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // 서버에 메시지 전송
      const token = localStorage.getItem('token');
      socket.emit('chat message', inputValue, token);
      setInputValue(''); // 입력창 초기화
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <List sx={{ maxHeight: '300px', overflowY: 'auto', backgroundColor: '#f0f0f0', borderRadius: '4px', mb: 2 }}>
        {messages.map((msg, index) => (
          <ListItem key={index}>
            <ListItemText primary={msg} />
          </ListItem>
        ))}
      </List>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="메세지를 입력하세요."
            variant="outlined"
            fullWidth
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button variant="contained" color="primary" type="submit">
            <SendIcon />
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default Chat;