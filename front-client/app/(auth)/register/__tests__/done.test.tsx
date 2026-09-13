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
      activity: 'leger',
    });
  });

  it('récapitule le profil qui vient d’être créé', () => {
    render(<RegisterDoneScreen />);

    expect(screen.getByText('Votre profil est prêt')).toBeTruthy();
    expect(screen.getByText('john@mail.com')).toBeTruthy();
    expect(screen.getByText('60 kg · 30 ans')).toBeTruthy();
    expect(screen.getByText('1.70 m')).toBeTruthy();
    expect(screen.getByText('10 h')).toBeTruthy();
    expect(screen.getByText('Léger · 1 à 2 séances / semaine')).toBeTruthy();
  });

  it('restitue les tranches par leur libellé, jamais par le nombre qui les code', () => {
    // 7 et 12 représentent « moins de 8 h » et « plus de 10 h » : ce sont des
    // valeurs de tranche, elles ne doivent pas s'afficher telles quelles.
    withParams({ hourSit: '7', activity: 'actif' });
    render(<RegisterDoneScreen />);

    expect(screen.getByText('Moins de 8 h')).toBeTruthy();
    expect(screen.queryByText(/^7/)).toBeNull();
    expect(screen.getByText('Actif · 5 séances / semaine ou plus')).toBeTruthy();
  });

  it('restitue le palier haut du temps assis', () => {
    withParams({ hourSit: '12', activity: 'sedentaire' });
    render(<RegisterDoneScreen />);

    expect(screen.getByText('Plus de 10 h')).toBeTruthy();
    expect(screen.getByText('Sédentaire · Peu ou pas de sport')).toBeTruthy();
  });

  it('rend les valeurs absentes lisibles', () => {
    withParams({});
    render(<RegisterDoneScreen />);

    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('remplace l’écran plutôt que de l’empiler en rejoignant la connexion', () => {
    // `replace` et non `push` : revenir en arrière depuis la connexion ne doit
    // pas ramener sur un récapitulatif d'inscription déjà validée.
    render(<RegisterDoneScreen />);
    fireEvent.press(screen.getByLabelText('Se connecter'));

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
