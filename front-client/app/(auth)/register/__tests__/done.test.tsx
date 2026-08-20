import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

jest.unmock('@react-navigation/native');

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

import { useLocalSearchParams, useRouter } from 'expo-router';

import RegisterDoneScreen from '../done';

const mockReplace = jest.fn();

function withParams(params: Record<string, string>) {
  (useLocalSearchParams as jest.Mock).mockReturnValue(params);
}

describe('RegisterDoneScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    withParams({
      email: 'john@mail.com',
      poids: '60',
      age: '30',
      taille: '1.70',
      hourSit: '10',
      isExercise: 'true',
      numberTraining: '2',
    });
  });

  it('récapitule le profil qui vient d’être créé', () => {
    render(<RegisterDoneScreen />);

    expect(screen.getByText('Votre profil est prêt')).toBeTruthy();
    expect(screen.getByText('john@mail.com')).toBeTruthy();
    expect(screen.getByText('60 kg · 30 ans')).toBeTruthy();
    expect(screen.getByText('1.70 m')).toBeTruthy();
    expect(screen.getByText('10 h par jour')).toBeTruthy();
    expect(screen.getByText('2 séances / semaine')).toBeTruthy();
  });

  it('restitue les paliers hauts par leur libellé, pas par leur valeur', () => {
    // 14 et 4 sont des sentinelles de l'étape 3 : elles signifient « plus de
    // 12 h » et « plus de 3 séances », et ne doivent pas s'afficher telles quelles.
    withParams({ hourSit: '14', isExercise: 'true', numberTraining: '4' });
    render(<RegisterDoneScreen />);

    expect(screen.getByText('Plus de 12 h par jour')).toBeTruthy();
    expect(screen.getByText('Plus de 3 séances / semaine')).toBeTruthy();
  });

  it('accorde le singulier pour une séance', () => {
    withParams({ isExercise: 'true', numberTraining: '1' });
    render(<RegisterDoneScreen />);
    expect(screen.getByText('1 séance / semaine')).toBeTruthy();
  });

  it('rend les valeurs absentes lisibles', () => {
    withParams({});
    render(<RegisterDoneScreen />);

    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.getByText('Pas d’activité régulière')).toBeTruthy();
  });

  it('remplace l’écran plutôt que de l’empiler en rejoignant la connexion', () => {
    // `replace` et non `push` : revenir en arrière depuis la connexion ne doit
    // pas ramener sur un récapitulatif d'inscription déjà validée.
    render(<RegisterDoneScreen />);
    fireEvent.press(screen.getByLabelText('Se connecter'));

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
