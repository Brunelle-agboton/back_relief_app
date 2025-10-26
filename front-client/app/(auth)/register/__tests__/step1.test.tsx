import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';

// Mock des modules de navigation
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}))

import RegisterStep1Screen from '../step1';

describe('step1', () => {
   const mockPush = jest.fn();
   
  beforeEach(() => {
   jest.clearAllMocks();
    (require('expo-router').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('affiche le titre et le logo', () => {
    render(<RegisterStep1Screen />);
    expect(screen.getByText('Créer un compte')).toBeTruthy();
    // Vérifie que l'image du logo est présente
    expect(screen.getByTestId('logo-image')).toBeTruthy();
  });

  it('affiche une erreur si champs vides', () => {
     render(<RegisterStep1Screen />);
    const button = screen.getByText('Suivant');

    fireEvent.press(button);
    expect(screen.getByText('Tous les champs sont obligatoires.')).toBeTruthy();
     expect(mockPush).not.toHaveBeenCalled();
  });

 it('navigue vers la page suivante si tous les champs sont remplis', () => {
    render(<RegisterStep1Screen />);

    fireEvent.changeText(screen.getByPlaceholderText("Nom d'utilisateur"), 'Brunelle');
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Mot de passe'), '123456');

    fireEvent.press(screen.getByText('Suivant'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/register/step2',
      params: {
        userName: 'Brunelle',
        email: 'test@example.com',
        password: '123456',
      },
    });
  });
});