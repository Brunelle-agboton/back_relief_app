import axios from 'axios';
import { getToken } from '../utils/storage';

const api = axios.create({
  baseURL: 'http://localhost:3000/', 
  timeout: 5000,
});

// Ajouter le token JWT dans les headers si disponible
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

export default api;