import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {jwtDecode}  from 'jwt-decode';
import LogoutScreen from '../app/screens/LogoutScreen';
import { useRouter } from 'expo-router';

const AuthContext = createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}>({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('auth_token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token: string) => {
    SecureStore.setItemAsync('auth_token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    SecureStore.deleteItemAsync('auth_token');
    setIsAuthenticated(false);
    router.replace('/screens/LogoutScreen');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export const getUserId = async () => {
  const token = await SecureStore.getItem('auth_token'); // Récupérer le token
  if (token) {
    const decoded: { sub: string } = jwtDecode(token); // Décoder le token
    return decoded.sub; 
  }
  return null;
};