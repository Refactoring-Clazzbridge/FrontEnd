import React, { createContext, useContext, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import socket from '../utils/socket';

// Context 생성
const SocketContext = createContext();

// Provider 컴포넌트
export const SocketProvider = ({children}) => {
  console.log("socket provider called");
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("socket provider useEffect called");

      socket.emit('connected', token);
      console.log('WebSocket connected');

      socket.on('initError', errorMessage => {
        console.error(errorMessage);
      });

      socket.on('initCompleted', () => {
        console.log("socket init complete")
      });

  }, []);

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