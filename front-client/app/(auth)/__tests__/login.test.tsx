import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';


// Mock des modules de navigation
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
   Link: ({ children, ...props }: any) => <>{children}</>,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));

// Mock du contexte d'auth (adapter le path à ton projet)
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    authState: { user: { role: 'user' } }, // <-- force role 'user' ici
    login: jest.fn(), // on peut spy si besoin
  }),
}));

// Mock API
   const mockReplace = jest.fn();
   const mockPush = jest.fn();
jest.mock('@/services/api', () => ({
  post: jest.fn(),
}));
jest.mock('@/utils/storage', () => ({
  saveToken: jest.fn(),
}));

import api from '@/services/api';
import { saveToken } from '@/utils/storage';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation for mocking
import LoginScreen from '../login';

describe('LoginScreen', () => {

  beforeEach(() => {
      jest.clearAllMocks();
       (useNavigation as jest.Mock).mockReturnValue({ navigate: jest.fn() });
  });

  it('affiche le logo et le titre', () => {
    render(<LoginScreen />);

    expect(screen.getAllByText('Se connecter')[0]).toBeTruthy();
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeTruthy();
  });

  it('navigue vers RegisterStep1Screen quand on clique sur Créer un compte patient', () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Créer un compte patient')); // Target the correct text
    expect((useNavigation().navigate as jest.Mock)).toHaveBeenCalledWith('register/step1');
  });

  it('connecte et navigue vers la page pauseActive', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { access_token: 'token123' } });
    render(<LoginScreen />);
    
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'john@mail.com');
    fireEvent.changeText(screen.getByPlaceholderText('Mot de passe'), '123456');
    fireEvent.press(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/user/login', { email: 'john@mail.com', password: '123456' });
      expect(saveToken).toHaveBeenCalledWith('token123');
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('affiche une erreur si le login échoue', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'john@mail.com');
    fireEvent.changeText(screen.getByPlaceholderText('Mot de passe'), 'badpass');
    fireEvent.press(screen.getByTestId('login-button')); // Use getByTestId
    // On attend que le message d'erreur apparaisse
    const errorMessage = await screen.findByText('Identifiants invalides');
    expect(errorMessage).toBeTruthy();
  });
});