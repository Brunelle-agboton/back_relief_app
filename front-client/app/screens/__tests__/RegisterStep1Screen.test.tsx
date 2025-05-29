import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RegisterStep1Screen from '../RegisterStep1Screen';

// Mock navigation
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

describe('RegisterStep1Screen', () => {
  it('affiche le titre et le logo', () => {
    const { getByText, getByTestId } = render(<RegisterStep1Screen />);
    expect(getByText('Créer un compte')).toBeTruthy();
    // Vérifie que l'image du logo est présente
    expect(getByTestId('logo-image')).toBeTruthy();
  });

  it('affiche une erreur si champs vides', () => {
    const { getByText } = render(<RegisterStep1Screen />);
    fireEvent.press(getByText('Suivant'));
    expect(getByText('Tous les champs sont obligatoires.')).toBeTruthy();
  });

  it('navigue vers RegisterStep2Screen si tout est rempli', () => {
    const navigate = jest.fn();
    // Remplace le mock pour ce test
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({ navigate });

    const { getByPlaceholderText, getByText } = render(<RegisterStep1Screen />);
    fireEvent.changeText(getByPlaceholderText("Nom d'utilisateur"), 'John');
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@mail.com');
    fireEvent.changeText(getByPlaceholderText('Mot de passe'), '123456');
    fireEvent.press(getByText('Suivant'));

    expect(navigate).toHaveBeenCalledWith('screens/RegisterStep2Screen', {
      userName: 'John',
      email: 'john@mail.com',
      password: '123456',
    });
  });
});