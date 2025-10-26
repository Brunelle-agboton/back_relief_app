import React from 'react';
import { Text } from 'react-native';

export const useRouter = () => ({
  replace: jest.fn(), // Change push to replace
  back: jest.fn(),
});

export const useLocalSearchParams = () => ({
  userName: 'mockUser',
  email: 'mock@example.com',
  password: 'mockPassword',
  age: '25',
  sexe: 'Homme',
  poids: '70',
  taille: '175',
});

export const Link = () => null; // Simplest mock for Link