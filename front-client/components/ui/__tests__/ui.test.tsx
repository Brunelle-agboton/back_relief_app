import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import {
  Button,
  Checkbox,
  Chip,
  FormError,
  Radio,
  Segmented,
  Text,
  TextField,
} from '@/components/ui';
import { ThemeProvider, getTheme } from '@/theme';

jest.unmock('@react-navigation/native');

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiGet: jest.fn(() => Promise.resolve([])),
  setItem: jest.fn(() => Promise.resolve()),
}));

describe('Button', () => {
  it('affiche son libellé et remonte les appuis', () => {
    const onPress = jest.fn();
    render(<Button title="Se connecter" onPress={onPress} testID="cta" />);

    fireEvent.press(screen.getByTestId('cta'));

    expect(screen.getByText('Se connecter')).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignore les appuis pendant le chargement', () => {
    // Le double envoi de formulaire est la régression classique d'un bouton
    // de soumission : le composant doit s'en prémunir lui-même.
    const onPress = jest.fn();
    render(<Button title="Se connecter" loading onPress={onPress} testID="cta" />);

    fireEvent.press(screen.getByTestId('cta'));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByTestId('cta')).toHaveAccessibilityState({ busy: true, disabled: true });
  });

  it('ignore les appuis lorsqu’il est désactivé', () => {
    const onPress = jest.fn();
    render(<Button title="Suivant" disabled onPress={onPress} testID="cta" />);

    fireEvent.press(screen.getByTestId('cta'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('conserve le libellé visible pendant le chargement', () => {
    // L'indicateur se superpose au libellé : le bouton ne doit pas changer de
    // largeur au moment de l'appui.
    render(<Button title="Créer mon compte" loading testID="cta" />);
    expect(screen.getByText('Créer mon compte')).toBeTruthy();
  });
});

describe('TextField', () => {
  it('transmet le placeholder et la saisie', () => {
    // Contrat dont dépendent les tests d'écrans existants, qui ciblent les
    // champs par `getByPlaceholderText`.
    const onChangeText = jest.fn();
    render(<TextField label="Email" placeholder="Email" onChangeText={onChangeText} />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'jean@mail.com');

    expect(onChangeText).toHaveBeenCalledWith('jean@mail.com');
  });

  it('affiche l’erreur en lieu et place de l’indication', () => {
    render(<TextField label="Email" hint="Votre adresse professionnelle" error="Adresse invalide" />);

    expect(screen.getByText('Adresse invalide')).toBeTruthy();
    expect(screen.queryByText('Votre adresse professionnelle')).toBeNull();
  });

  it('affiche l’indication en l’absence d’erreur', () => {
    render(<TextField label="Email" hint="Votre adresse professionnelle" />);
    expect(screen.getByText('Votre adresse professionnelle')).toBeTruthy();
  });
});

describe('FormError', () => {
  it('ne rend rien sans message', () => {
    render(<FormError message={null} testID="err" />);
    expect(screen.queryByTestId('err')).toBeNull();
  });

  it('annonce le message aux lecteurs d’écran', () => {
    render(<FormError message="Identifiants invalides" testID="err" />);

    expect(screen.getByText('Identifiants invalides')).toBeTruthy();
    expect(screen.getByTestId('err')).toHaveAccessibilityState({});
    expect(screen.getByTestId('err').props.accessibilityRole).toBe('alert');
  });
});

describe('contrôles de sélection', () => {
  it('expose l’état du bouton radio', () => {
    const onPress = jest.fn();
    render(<Radio label="Femme" selected onPress={onPress} testID="radio-femme" />);

    const radio = screen.getByTestId('radio-femme');
    fireEvent.press(radio);

    expect(radio.props.accessibilityRole).toBe('radio');
    expect(radio).toHaveAccessibilityState({ selected: true });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('expose l’état de la case à cocher', () => {
    render(<Checkbox label="Rappels de pause" checked={false} onPress={jest.fn()} testID="rest" />);

    const box = screen.getByTestId('rest');
    expect(box.props.accessibilityRole).toBe('checkbox');
    expect(box).toHaveAccessibilityState({ checked: false });
  });

  it('remonte la valeur métier du contrôle segmenté', () => {
    // Le composant est générique : les options portent la valeur métier, les
    // écrans n'ont pas à traduire un index.
    const onChange = jest.fn();
    render(
      <Segmented
        value={null}
        onChange={onChange}
        options={[
          { label: 'Oui', value: 'yes', testID: 'exercise-yes' },
          { label: 'Non', value: 'no', testID: 'exercise-no' },
        ]}
      />,
    );

    fireEvent.press(screen.getByTestId('exercise-yes'));

    expect(onChange).toHaveBeenCalledWith('yes');
    expect(screen.getByTestId('exercise-no')).toHaveAccessibilityState({ selected: false });
  });
});

describe('réactivité au thème', () => {
  it('applique la couleur de l’ambiance active', () => {
    const brume = getTheme('brume', 'light');
    render(
      <ThemeProvider initialAmbiance="brume" initialMode="light" persist={false}>
        <Text variant="h1">Connexion</Text>
      </ThemeProvider>,
    );

    expect(screen.getByText('Connexion')).toHaveStyle({ color: brume.colors.ink });
  });

  it('suit le changement d’ambiance et de schéma', () => {
    const terracottaDark = getTheme('terracotta', 'dark');
    render(
      <ThemeProvider initialAmbiance="terracotta" initialMode="dark" persist={false}>
        <Chip label="Assis" variant="cat" />
      </ThemeProvider>,
    );

    // `.pa-chip-cat` : aplat `--accent-soft`, texte `--accent-deep`.
    expect(screen.getByText('Assis')).toHaveStyle({ color: terracottaDark.colors.accentDeep });
  });

  it('rend les primitives sans provider', () => {
    // Même contrat que le thème : les écrans sont testés isolément.
    render(<Button title="Suivant" testID="cta" />);
    expect(screen.getByTestId('cta')).toBeTruthy();
  });
});
