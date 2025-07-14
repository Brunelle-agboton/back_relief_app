import axios from 'axios';
import { getToken } from '../utils/storage';

 export const baseURL = 'https://6f94448ed8ae.ngrok-free.app/';

const api = axios.create({
  //baseURL: 'http://localhost:3000/', 
  baseURL: baseURL,
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
//U6xKeW6nJsKp.zW
export default api;