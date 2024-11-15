import { io } from "socket.io-client";
const socket = io(
  "http://175.106.99.175:3001"
);
export default socket;
