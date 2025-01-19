import * as React from 'react';
import Sheet from '@mui/joy/Sheet';

import MessagesPane from './MessagesPane';
import ChatsPane from './ChatsPane';
import { ChatProps } from '../../models/chat';
import {useSelector} from "react-redux";

export default function MyMessages() {
  const [selectedChat, setSelectedChat] = React.useState(null); // 초기 값 null
  const [chats, setChats] = React.useState([]);
  const socket = useSelector((state) => state.socket.socket);

  React.useEffect(() => {

    socket.emit('requestChats'); // 서버에 채팅방 목록 요청

    // 서버에서 채팅방 목록을 받았을 때 실행
    socket.on('chats', (fetchedChats) => {
      console.log("chats fetched : ", fetchedChats);
      setChats(fetchedChats);
    });

    // 서버에서 채팅방 목록을 받았을 때 실행
    socket.on('initError',  errorMessage => {
      console.error(errorMessage);
    });

  }, []);


  return (
      <Sheet
          sx={{
            flex: 1,
            width: '100%',
            mx: 'auto',
            pt: { xs: 'var(--Header-height)', md: 0 },
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'minmax(min-content, min(30%, 400px)) 1fr',
            },
          }}
      >
        <Sheet
            sx={{
              position: { xs: 'fixed', sm: 'sticky' },
              transform: {
                xs: 'translateX(calc(100% * (var(--MessagesPane-slideIn, 0) - 1)))',
                sm: 'none',
              },
              transition: 'transform 0.4s, width 0.4s',
              zIndex: 100,
              width: '100%',
            }}
        >
          <ChatsPane
              chats={chats} // 서버에서 받아온 채팅방 목록 사용
              selectedChatId={selectedChat ? selectedChat.id : null} // selectedChat이 있을 때만 id 접근
              setSelectedChat={setSelectedChat}
          />
        </Sheet>

        {selectedChat ? ( // selectedChat이 있을 때만 MessagesPane 렌더링
            <MessagesPane chat={selectedChat} />
        ) : (

            <div style={{display:'flex', alignItems: 'center', flexDirection: 'row', justifyContent:'center', fontWeight: '600'}}>채팅을 선택하세요</div> // selectedChat이 없을 때 표시할 내용
        )}
      </Sheet>
  );
}