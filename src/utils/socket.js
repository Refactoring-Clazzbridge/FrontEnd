import { io } from "socket.io-client";
const socket = io(
  "http://default-websocket-servic-3b8f6-100169772-9abcce8b6147.kr.lb.naverncp.com:3001"
);
export default socket;
