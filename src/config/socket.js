// import { io } from "socket.io-client";
//
// export const initializeSocket = (token) => {
//   const socket = io(
//       process.env.REACT_APP_SOCKET_SERVER_URI,{
//         autoConnect: false,
//       }
//   );
//
//   socket.auth = {token};
//
//   socket.on('connect', () => {
//     console.log('Socket connected:', socket.id);
//   });
//
//   socket.on('disconnect', () => {
//     console.log('Socket disconnected');
//   });
//
//   socket.on('initError', (errorMessage) => {
//     console.error('Init error:', errorMessage);
//   });
//
//   return socket;
// };