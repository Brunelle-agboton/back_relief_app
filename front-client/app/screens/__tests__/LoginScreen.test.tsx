import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

// Mock API et navigation
const mockPush = jest.fn();
const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));
jest.mock('../../../services/api', () => ({
  post: jest.fn(),
}));
jest.mock('../../../utils/storage', () => ({
  saveToken: jest.fn(),
}));

import api from '../../../services/api';
import { saveToken } from '../../../utils/storage';

describe('LoginScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockNavigate.mockClear();
    (api.post as jest.Mock).mockClear();
    (saveToken as jest.Mock).mockClear();
  });

  it('affiche le logo et le titre', () => {
    const { getAllByText, getByPlaceholderText } = render(<LoginScreen />);
    expect(getAllByText('Se connecter')[0]).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Mot de passe')).toBeTruthy();
  });

  it('navigue vers RegisterStep1Screen quand on clique sur S\'inscrire', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText("S'inscrire"));
    expect(mockNavigate).toHaveBeenCalledWith('screens/RegisterStep1Screen');
  });

  it('connecte et navigue vers la page pauseActive', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { access_token: 'token123' } });
    const { getByText, getAllByText, getByPlaceholderText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@mail.com');
    fireEvent.changeText(getByPlaceholderText('Mot de passe'), '123456');
    fireEvent.press(getAllByText('Se connecter')[1]);
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/user/login', { email: 'john@mail.com', password: '123456' });
      expect(saveToken).toHaveBeenCalledWith('token123');
      expect(mockPush).toHaveBeenCalledWith('/(tabs)/pauseActive/pauseActive');
    });
  });

  it('affiche une erreur si le login échoue', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('fail'));
    const { getAllByText, getByPlaceholderText, findByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@mail.com');
    fireEvent.changeText(getByPlaceholderText('Mot de passe'), 'badpass');
    fireEvent.press(getAllByText('Se connecter')[1]);
    // On attend que le message d'erreur apparaisse
    const errorMessage = await findByText('Identifiants invalides');
    expect(errorMessage).toBeTruthy();
  });
});