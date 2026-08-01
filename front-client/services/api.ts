import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';

export const baseURL = process.env.EXPO_PUBLIC_API_URL ?? '';

const api = axios.create({
  baseURL,
  timeout: 15000,
});

// Callback déclenché sur une réponse 401 (token expiré/invalide) — injecté par AuthContext
let onUnauthorized: (() => void) | null = null;
export const setOnUnauthorized = (fn: () => void) => {
  onUnauthorized = fn;
};

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeToken();
      onUnauthorized?.();
      return Promise.reject(error);
    }

    if (!error.response) {
      // Erreur réseau : pas de réponse du serveur
      error.userMessage =
        error.code === 'ECONNABORTED'
          ? 'La requête a pris trop de temps. Réessayez.'
          : 'Connexion impossible. Vérifiez votre connexion internet.';
    } else if (error.response.status >= 500) {
      error.userMessage = 'Une erreur serveur est survenue. Réessayez plus tard.';
    }

    return Promise.reject(error);
  }
);

export default api;
