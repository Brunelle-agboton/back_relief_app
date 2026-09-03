import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

// Mock de l'API
jest.mock('@/services/api', () => ({
  post: jest.fn(),
}));

import api from '@/services/api';
import RegisterStep3Screen from '../step3';

describe('RegisterStep3Screen', () => {
   const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (require('expo-router').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
    userName: 'John',
    email: 'john@mail.com',
    password: '123456',
    age: '30',
    sexe: 'Femme',
    poids: '60',
    taille: '170',
  }),
    (api.post as jest.Mock).mockClear();
    // Removed useNavigation and useRoute calls from here
  });

  it('affiche le logo et les champs', () => {
    const { getByText, getByRole } = render(<RegisterStep3Screen />);
    expect(getByText(/En moyenne, vous êtes assis/i)).toBeTruthy();
    expect(getByText(/Niveau d'activité physique/i)).toBeTruthy();
    expect(getByText(/Souhaitez-vous activer les rappels/i)).toBeTruthy();
  });

  it('envoie les données et navigue vers LoginScreen', async () => {
    (api.post as jest.Mock).mockResolvedValue({});

    const { getByTestId, getByLabelText } = render(<RegisterStep3Screen />);
    // Sélectionne "10 h" de temps assis
    fireEvent.press(getByTestId('sit-10'));
    // Le niveau d'activité porte désormais `isExercise` et `numberTraining` :
    // « Léger » vaut une activité régulière à deux séances par semaine.
    fireEvent.press(getByTestId('activity-leger'));
    // Sélectionne "Oui" pour rappel de pause
    fireEvent.press(getByTestId('reset-yes'));
    // Sélectionne "Non" pour rappel d'hydratation
    fireEvent.press(getByTestId('drink-no'));
    // Valide
    fireEvent.press(getByLabelText('Suivant')); // Changed from 'Valider' to 'Suivant'

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
      // Le parcours ne mène plus directement à la connexion : il se termine sur
      // l'écran de confirmation (étape 6/6 du design), d'où l'utilisateur
      // rejoint ensuite la connexion.
      expect(useRouter().push).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/register/done' }),
      );
    });
  });

  it('affiche une erreur si l\'API échoue', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('fail'));
    const { getByText, findByText, getByTestId } = render(<RegisterStep3Screen />);
    fireEvent.press(getByTestId('sit-10'));
    fireEvent.press(getByTestId('activity-leger'));
    fireEvent.press(getByTestId('reset-yes'));
    fireEvent.press(getByTestId('drink-no'));
    fireEvent.press(getByText('Suivant')); // Changed from 'Valider' to 'Suivant'

    expect(await findByText(/Erreur lors de l'inscription/)).toBeTruthy();
  });
});