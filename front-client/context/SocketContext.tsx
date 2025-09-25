
import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from "@/services/api";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('SocketProvider useEffect - authState:', authState);
    const userId = authState.user?.sub;
    const token = authState.token;

    if (userId && token && !socket) {
      const newSocket = io('https://privately-beloved-cowbird.ngrok-free.app/webrtc', {
        query: { userId: userId },
        auth: {
          token: token,
        },
      });

        newSocket.on('connect', () => {
          setIsConnected(true);
          console.log('Socket connected to /webrtc');
        });

        newSocket.on('disconnect', () => {
          setIsConnected(false);
          console.log('Socket disconnected from /webrtc');
        });

        newSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err.message);
        });

        setSocket(newSocket);
      };

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null); // Clear socket on disconnect
      }
    };
  }, [authState.user, socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
