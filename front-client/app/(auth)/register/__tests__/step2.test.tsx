import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';

// Mock des modules de navigation
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}))

import RegisterStep2Screen from '../step2';

describe('step2', () => {
   const mockPush = jest.fn();

  beforeEach(() => {
   jest.clearAllMocks();
   (require('expo-router').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
   (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
      userName: 'John',
      email: 'john@mail.com',
      password: '123456',
    });
  });

  it('affiche le logo et la description', () => {
    render(<RegisterStep2Screen />);
    expect(screen.getByTestId('logo-image')).toBeTruthy();
    expect(
      screen.getByText(/Personnalisez votre expérience pour des recommandations ciblées/i)
    ).toBeTruthy();
  });

  it('permet de sélectionner le sexe', () => {
    render(<RegisterStep2Screen />);
    // Check if radio buttons are present by their testID
    expect(screen.getByTestId('radio-homme')).toBeTruthy();
    expect(screen.getByTestId('radio-femme')).toBeTruthy();
    expect(screen.getByTestId('radio-nonbinaire')).toBeTruthy();
  });

  it('navigue vers RegisterStep3Screen avec les bonnes valeurs', () => {
    render(<RegisterStep2Screen />);
    // Sélectionne "Femme"
    fireEvent.press(screen.getByTestId('radio-femme'));
    fireEvent.changeText(screen.getByPlaceholderText('Âge'), '30');
    fireEvent.changeText(screen.getByPlaceholderText('Taille'), '1.70');
    fireEvent.changeText(screen.getByPlaceholderText('Poids'), '60');
    fireEvent.press(screen.getByLabelText('Suivant'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/register/step3',
      params: {
        userName: 'John',
        email: 'john@mail.com',
        password: '123456',
        age: '30',
        sexe: 'Femme',
        poids: '60',
        taille: '1.70',
      },
    });
  });
});