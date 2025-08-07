import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { Photo, PhotoSession } from '@snapstudio/types';

interface SocketEvents {
  'new-photo': (photo: Photo) => void;
  'photo-starred': (data: { photoId: string; starred: boolean }) => void;
  'session-updated': (session: PhotoSession) => void;
  'session-created': (session: PhotoSession) => void;
  'session-completed': (data: { sessionId: string }) => void;
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io({
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const on = <K extends keyof SocketEvents>(
    event: K,
    callback: SocketEvents[K]
  ) => {
    if (socket) {
      socket.on(event, callback as any);
    }
  };

  const off = <K extends keyof SocketEvents>(
    event: K,
    callback?: SocketEvents[K]
  ) => {
    if (socket) {
      socket.off(event, callback as any);
    }
  };

  const emit = (event: string, data?: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  return {
    socket,
    isConnected,
    on,
    off,
    emit,
  };
}