import { io } from 'socket.io-client';

// Get socket URL from environment or use default
const getSocketURL = () => {
  if (import.meta.env.VITE_API_URL) {
    // Extract base URL from API URL (remove /api part)
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketURL();

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        resolve(this.socket);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(userId) {
    if (this.socket) {
      this.socket.emit('joinRoom', userId);
    }
  }

  leaveRoom(userId) {
    if (this.socket) {
      this.socket.emit('leaveRoom', userId);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
