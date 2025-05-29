import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterStep3Screen from '../RegisterStep3Screen';

// Mock navigation et route
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: {
      userName: 'John',
      email: 'john@mail.com',
      password: '123456',
      age: '30',
      sexe: 'Femme',
      poids: '60',
      taille: '170',
    },
  }),
}));

// Mock de l'API
jest.mock('../../../services/api', () => ({
  post: jest.fn(),
}));

import api from '../../../services/api';

describe('RegisterStep3Screen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    (api.post as jest.Mock).mockClear();
  });

  it('affiche le logo et les champs', () => {
    const { getByText, getByRole } = render(<RegisterStep3Screen />);
    expect(getByText(/En moyenne, vous êtes assis/i)).toBeTruthy();
    expect(getByText(/Activité physique régulière/i)).toBeTruthy();
    expect(getByText(/Souhaitez-vous activer les rappels/i)).toBeTruthy();
  });

  it('envoie les données et navigue vers LoginScreen', async () => {
    (api.post as jest.Mock).mockResolvedValue({});

    const { getByText, getAllByText,getByTestId, findByTestId } = render(<RegisterStep3Screen />);
    // Sélectionne "10" heures assis
    fireEvent.press(getByText('10'));
    // Sélectionne "Oui" pour activité physique
    fireEvent.press(getByTestId('exercise-yes'));
    // Attendre que le bouton training-2 soit présent
    const training2Btn = await findByTestId('training-2');
    fireEvent.press(training2Btn);
    // Sélectionne "Oui" pour rappel de pause
    fireEvent.press(getByTestId('reset-yes'));
    // Sélectionne "Non" pour rappel d'hydratation
    fireEvent.press(getByTestId('drink-no'));
    // Valide
    fireEvent.press(getByText('Valider'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/user/register', expect.objectContaining({
        email: 'john@mail.com',
        password: '123456',
        userName: 'John',
        age: 30,
        sexe: 'Femme',
        poids: 60,
        taille: 170,
        hourSit: 10,
        isExercise: true,
        numberTraining: 2,
        restReminder: true,
        drinkReminder: false,
        role: 'user',
      }));
      expect(mockNavigate).toHaveBeenCalledWith('screens/LoginScreen');
    });
  });

  it('affiche une erreur si l\'API échoue', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('fail'));
    const { getByText, getAllByText, findByText, getByTestId, findByTestId } = render(<RegisterStep3Screen />);
    fireEvent.press(getByText('10'));
    fireEvent.press(getAllByText('Oui')[0]);
    fireEvent.press(getByTestId('exercise-yes'));
    const training2Btn = await findByTestId('training-2');
    fireEvent.press(training2Btn);
    fireEvent.press(getByTestId('reset-yes'));
    fireEvent.press(getByTestId('drink-no'));
    fireEvent.press(getByText('Valider'));

    expect(await findByText(/Erreur lors de l'inscription/)).toBeTruthy();
  });
});