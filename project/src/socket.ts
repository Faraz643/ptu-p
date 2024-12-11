import { io as socketIO } from 'socket.io-client';

// Create socket connection with the server
export const socket = socketIO('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: true,
  withCredentials: true,
});