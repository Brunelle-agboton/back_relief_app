import axios from 'axios';
import { getToken } from '../utils/storage';

 export const baseURL = 'https://privately-beloved-cowbird.ngrok-free.app/';

const api = axios.create({
  // baseURL: 'http://localhost:3000/', 
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

//ngrok http --url=privately-beloved-cowbird.ngrok-free.app 3000

// maintenant que l'inscription des practitioner est ok peux tu fetch les donnes du backend dans ProListScreen. S'il te plait met juste        │
// en place la recuperation, ne modifie pas autre chose  