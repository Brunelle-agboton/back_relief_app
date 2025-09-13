import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';

// 1. On définit les types pour le rôle et le profil utilisateur
type UserRole = 'user' | 'practitioner';

interface UserProfile {
  sub: string; // L'ID de l'utilisateur
  name: string; // Le nom de l'utilisateur
  email: string;
  role: string
}

// 2. On définit la structure de notre état d'authentification
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: UserProfile | null;
}

interface AuthContextData {
  authState: AuthState;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

// 3. On crée le contexte avec une valeur par défaut complète
const AuthContext = createContext<AuthContextData>({
  authState: {
    token: null,
    isAuthenticated: false,
    user: null,
  },
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        // Si un token est trouvé, on le décode et on restaure l'état complet
        const decoded: UserProfile= jwtDecode(token);
        setAuthState({
          token,
          isAuthenticated: true,
          user: decoded,
        });
      }
      setIsLoading(false);
    };

    loadToken();
  }, []);

  const login = (token: string) => {
    // À la connexion, on décode le token pour remplir l'état
    const decoded: UserProfile = jwtDecode(token);
    setAuthState({
      token,
      isAuthenticated: true,
      user: decoded,
    });
    SecureStore.setItemAsync('auth_token', token);
  };

  const logout = () => {
    SecureStore.deleteItemAsync('auth_token');
    setAuthState({ token: null, isAuthenticated: false, user: null });
    // On redirige vers l'écran de login après la déconnexion
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider value={{ authState, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook custom pour un accès simple au contexte
export const useAuth = () => useContext(AuthContext);

 export const getUserId = async () => {                                        
   const token = await SecureStore.getItem('auth_token'); // Récupérer le token
      if (token) {                                                                
  const decoded: { sub: string } = jwtDecode(token); // Décoder le token    
    return decoded.sub;                                                       
 }                                                                           
  return null;                                                                
}