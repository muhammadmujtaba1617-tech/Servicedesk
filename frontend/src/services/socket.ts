import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://servicedesk-backened.vercel.app'
    : 'http://localhost:3000');

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to ServiceDesk real-time WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
    });
  }

  return socket;
};

export const joinTicketRoom = (ticketId: string) => {
  const s = getSocket();
  s.emit('join:ticket', ticketId);
};

export const leaveTicketRoom = (ticketId: string) => {
  const s = getSocket();
  s.emit('leave:ticket', ticketId);
};

export const joinRoleRoom = (role: string) => {
  const s = getSocket();
  s.emit('join:role', role);
};

export const joinUserRoom = (userId: string) => {
  const s = getSocket();
  s.emit('join:user', userId);
};
