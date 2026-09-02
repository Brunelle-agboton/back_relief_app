import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';
import { setOnUnauthorized } from '../services/api';

type UserRole = 'user' | 'practitioner';

interface UserProfile {
  /** Identifiant utilisateur : UUID depuis le passage des clés primaires en uuid. */
  sub: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: UserProfile | null;
}

interface AuthContextData {
  authState: AuthState;
  /**
   * Authentifie l'utilisateur et retourne son profil décodé.
   * Le retour est indispensable : `authState` n'est mis à jour qu'au rendu
   * suivant, il ne peut donc pas être lu juste après l'appel.
   */
  login: (token: string) => UserProfile;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({
  authState: { token: null, isAuthenticated: false, user: null },
  login: () => {
    throw new Error('login appelé hors AuthProvider');
  },
  logout: () => {},
  isLoading: true,
});

function decodeAndValidateToken(token: string): UserProfile {
  const decoded = jwtDecode<Record<string, unknown>>(token);
  if (
    decoded.sub == null ||
    typeof decoded.email !== 'string' ||
    typeof decoded.role !== 'string'
  ) {
    throw new Error('Token invalide : champs requis manquants');
  }
  return decoded as unknown as UserProfile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = () => {
    SecureStore.deleteItemAsync('auth_token').catch(() => {});
    setAuthState({ token: null, isAuthenticated: false, user: null });
    router.replace('/(auth)/login');
  };

  // Enregistre le callback de déconnexion dans le client API
  useEffect(() => {
    setOnUnauthorized(logout);
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          const user = decodeAndValidateToken(token);
          setAuthState({ token, isAuthenticated: true, user });
        }
      } catch {
        // Token absent, corrompu ou expiré : on repart de zéro
        await SecureStore.deleteItemAsync('auth_token').catch(() => {});
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = (token: string): UserProfile => {
    try {
      const user = decodeAndValidateToken(token);
      setAuthState({ token, isAuthenticated: true, user });
      SecureStore.setItemAsync('auth_token', token).catch(() => {});
      return user;
    } catch {
      throw new Error('Impossible de traiter le token reçu du serveur.');
    }
  };

  return (
    <AuthContext.Provider value={{ authState, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export const getUserId = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) return null;
    const decoded: { sub: number | string } = jwtDecode(token);
    return decoded.sub != null ? String(decoded.sub) : null;
  } catch {
    return null;
  }
};
