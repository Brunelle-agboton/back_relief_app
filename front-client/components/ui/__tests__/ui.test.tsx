import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import {
  Button,
  MIN_HIT_TARGET,
  Checkbox,
  Chip,
  FormMessage,
  OptionRow,
  Radio,
  Segmented,
  StepHeader,
  StepProgress,
  Text,
  TextField,
} from '@/components/ui';
import { ThemeProvider, defaultAmbiance, getTheme } from '@/theme';

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

describe('Button — spécification du design system', () => {
  it('adopte le rayon du design system, et non la pilule du kit d’origine', () => {
    const theme = getTheme(defaultAmbiance, 'light');
    render(<Button title="Continuer" testID="cta" />);

    expect(screen.getByTestId('cta')).toHaveStyle({ borderRadius: theme.radius.md });
    expect(theme.radius.md).not.toBe(theme.radius.pill);
  });

  it('respecte la zone tactile minimale', () => {
    render(<Button title="Continuer" testID="cta" />);
    expect(screen.getByTestId('cta')).toHaveStyle({ minHeight: MIN_HIT_TARGET });
  });

  it('pose le libellé du bouton de réussite sur l’aplat vert', () => {
    // Le design system décrit l'inverse — libellé vert sur aplat vert clair,
    // soit 1.49:1. Le rapport est inversé sur décision du client.
    const theme = getTheme(defaultAmbiance, 'light');
    render(<Button title="Valider" variant="success" testID="cta" />);

    expect(screen.getByTestId('cta')).toHaveStyle({ backgroundColor: theme.colors.good });
    expect(screen.getByText('Valider')).toHaveStyle({ color: theme.colors.onGood });
  });

  it('colore le bouton secondaire selon le design system', () => {
    const theme = getTheme(defaultAmbiance, 'light');
    render(<Button title="Précédent" variant="secondary" testID="cta" />);

    expect(screen.getByTestId('cta')).toHaveStyle({
      backgroundColor: theme.colors.accentSoft,
      borderColor: theme.colors.accent,
    });
    expect(screen.getByText('Précédent')).toHaveStyle({ color: theme.colors.accent });
  });
});

describe('FormMessage', () => {
  it('écrit la réussite avec la variante contrastée, pas l’aplat', () => {
    // `good` vaut #39DF87 en ambiance brume : 1.74:1 sur fond clair.
    const theme = getTheme(defaultAmbiance, 'light');
    render(<FormMessage message="Email envoyé." tone="success" testID="ok" />);

    expect(screen.getByTestId('ok')).toHaveStyle({ backgroundColor: theme.colors.goodSoft });
    expect(screen.getByText('Email envoyé.')).toHaveStyle({ color: theme.colors.goodDeep });
    expect(theme.colors.goodDeep).not.toBe(theme.colors.good);
  });

  it('écrit l’erreur avec la variante contrastée', () => {
    const theme = getTheme(defaultAmbiance, 'light');
    render(<FormMessage message="Identifiants invalides" testID="err" />);

    expect(screen.getByText('Identifiants invalides')).toHaveStyle({
      color: theme.colors.dangerDeep,
    });
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

describe('TextField — révélation du mot de passe', () => {
  it('masque la saisie par défaut et la révèle sur demande', () => {
    render(<TextField label="Mot de passe" placeholder="Mot de passe" secureTextEntry />);

    const input = screen.getByPlaceholderText('Mot de passe');
    expect(input.props.secureTextEntry).toBe(true);

    fireEvent.press(screen.getByLabelText('Afficher le mot de passe'));

    expect(screen.getByPlaceholderText('Mot de passe').props.secureTextEntry).toBe(false);
    expect(screen.getByLabelText('Masquer le mot de passe')).toBeTruthy();
  });

  it('ne rend pas le champ plus haut que les autres', () => {
    // Le révélateur mesure 37.5 pt là où l'interligne du texte en fait 22 :
    // dans le flux, il rendait le champ de mot de passe visiblement plus haut
    // que celui de l'e-mail, juste au-dessus.
    render(<TextField placeholder="Mot de passe" secureTextEntry />);

    expect(screen.getByLabelText('Afficher le mot de passe')).toHaveStyle({
      position: 'absolute',
    });
  });

  it('n’affiche pas le révélateur sur un champ ordinaire', () => {
    render(<TextField label="Email" placeholder="Email" />);
    expect(screen.queryByLabelText('Afficher le mot de passe')).toBeNull();
  });

  it('permet de désactiver le révélateur', () => {
    render(<TextField placeholder="Code" secureTextEntry showVisibilityToggle={false} />);
    expect(screen.queryByLabelText('Afficher le mot de passe')).toBeNull();
  });
});

describe('parcours par étapes', () => {
  it('décrit l’avancement aux technologies d’assistance', () => {
    render(<StepProgress step={1} count={3} />);

    const bar = screen.getByRole('progressbar');
    expect(bar.props.accessibilityValue).toEqual({ min: 1, max: 3, now: 2 });
  });

  it('affiche la position dans le parcours', () => {
    render(<StepHeader step={0} count={3} />);
    expect(screen.getByText(/Étape 1 \/ 3/)).toBeTruthy();
  });

  it('n’expose le retour que lorsqu’il est possible', () => {
    const onBack = jest.fn();
    const { rerender } = render(<StepHeader step={0} count={3} />);
    expect(screen.queryByLabelText('Précédent')).toBeNull();

    rerender(<StepHeader step={1} count={3} onBack={onBack} />);
    fireEvent.press(screen.getByLabelText('Précédent'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe('OptionRow', () => {
  it('annonce un choix exclusif, libellé et précision réunis', () => {
    const onPress = jest.fn();
    render(
      <OptionRow
        label="Modéré"
        description="3 à 4 séances / semaine"
        selected
        onPress={onPress}
        testID="act-modere"
      />,
    );

    const row = screen.getByTestId('act-modere');
    expect(row.props.accessibilityRole).toBe('radio');
    expect(row.props.accessibilityLabel).toBe('Modéré, 3 à 4 séances / semaine');
    expect(row).toHaveAccessibilityState({ selected: true });

    fireEvent.press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('FormMessage', () => {
  it('ne rend rien sans message', () => {
    render(<FormMessage message={null} testID="err" />);
    expect(screen.queryByTestId('err')).toBeNull();
  });

  it('annonce le message aux lecteurs d’écran', () => {
    render(<FormMessage message="Identifiants invalides" testID="err" />);

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
