import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode}  from 'jwt-decode';

const TOKEN_KEY = '@auth_token';

export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du token', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Erreur lors de la récupération du token', error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression du token', error);
  }
};

export const getUserId = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY); // Récupérez le token
  if (token) {
    const decoded: { sub: string } = jwtDecode(token); // Décodez le token
    return decoded.sub; // Assurez-vous que l'ID utilisateur est stocké sous "sub"
  }
  return null;
};