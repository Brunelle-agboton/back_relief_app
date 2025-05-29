import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RegisterStep2Screen from '../RegisterStep2Screen';

// Mock navigation et route
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
    useRoute: () => ({
      params: {
        userName: 'John',
        email: 'john@mail.com',
        password: '123456',
      },
    }),
  };
});

describe('RegisterStep2Screen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('affiche le logo et la description', () => {
    const { getByTestId, getByText } = render(<RegisterStep2Screen />);
    expect(getByTestId('logo-image')).toBeTruthy();
    expect(
      getByText(/Personnalisez votre expérience pour des recommandations ciblées/i)
    ).toBeTruthy();
  });

  it('permet de sélectionner le sexe', () => {
    const { getAllByRole } = render(<RegisterStep2Screen />);
    // Il y a 3 boutons radio (TouchableOpacity)
    expect(getAllByRole('button').length).toBeGreaterThanOrEqual(1);
  });

  it('navigue vers RegisterStep3Screen avec les bonnes valeurs', () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(<RegisterStep2Screen />);
    // Sélectionne "Femme"
    fireEvent.press(getByTestId('radio-femme'));
    fireEvent.changeText(getByPlaceholderText('Âge'), '30');
    fireEvent.changeText(getByPlaceholderText('Taille'), '1.70');
    fireEvent.changeText(getByPlaceholderText('Poids'), '60');
    fireEvent.press(getByText('Suivant'));

    expect(mockNavigate).toHaveBeenCalledWith('screens/RegisterStep3Screen', {
      userName: 'John',
      email: 'john@mail.com',
      password: '123456',
      age: '30',
      sexe: 'Femme',
      poids: '60',
      taille: '1.70',
    });
  });
});