import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState
} from 'react';
import {useToken} from "./TokenContext";
import {useLogin} from "./LoginContext";
import { io } from "socket.io-client";
import {setConnected, setSocket} from "../redux/socketSlice";
import {useDispatch, useSelector} from "react-redux";

// Context 생성
const SocketContext = createContext();

const initializeSocket = (token) => {
  const socket = io(
      process.env.REACT_APP_SOCKET_SERVER_URI,{
        autoConnect: false,
      }
  );

  socket.auth = {token};

  socket.on('connect', () => {
    console.log('Socket connected, id is :', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('initError', (errorMessage) => {
    console.error('Init error:', errorMessage);
  });

  return socket;
}

const connectSocket = (dispatch, token) => {
  const socket = initializeSocket(token);

  socket.connect();
  dispatch(setSocket(socket));
  dispatch(setConnected(true));
}

const disconnectSocket = (dispatch, socket) => {
  if (socket) {
    socket.disconnect();
    dispatch(setConnected(false));
  }
}

// Provider 컴포넌트
export const SocketProvider = ({children}) => {
  console.log("socket provider called");
  const dispatch = useDispatch();
  const {token} = useToken();
  //const {isLoggedIn} = useLogin();
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn"));
  const socket = useSelector(state => state.socket.socket);

  useEffect(() => {
    console.log(isLoggedIn);
    if (isLoggedIn ) {
      connectSocket(dispatch, token);
    } else if (socket && socket.connected){
      //disconnectSocket(dispatch, socket);
    }

    return () => {
      // 클린업 처리하지 않음 (새로고침에도 소켓 유지)
    };
  }, [isLoggedIn]);

  return (
      <SocketContext.Provider value={socket}>
        {children}
      </SocketContext.Provider>
  );
};

// SocketContext를 사용하는 커스텀 훅
export const useSocket = () => {
  return useContext(SocketContext);
};