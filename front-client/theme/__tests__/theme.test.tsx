import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';

import {
  ThemeProvider,
  ambianceNames,
  defaultAmbiance,
  getTheme,
  makeStyles,
  themes,
  toNavigationTheme,
  useTheme,
} from '@/theme';
import type { AmbianceName, ColorScheme, Theme } from '@/theme';

// Le repo fournit un mock manuel global de `@react-navigation/native`
// (`__mocks__/@react-navigation/native.tsx`) que Jest applique automatiquement
// et qui n'exporte que `useNavigation` / `useRoute`. Le pont de thème s'appuie
// sur `DefaultTheme` / `DarkTheme` : on exerce donc le vrai module.
jest.unmock('@react-navigation/native');

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiGet: jest.fn(() => Promise.resolve([])),
  setItem: jest.fn(() => Promise.resolve()),
}));

const allThemes: Theme[] = ambianceNames.flatMap((ambiance) =>
  (['light', 'dark'] as ColorScheme[]).map((scheme) => getTheme(ambiance, scheme)),
);

function Probe() {
  const theme = useTheme();
  return <Text testID="probe">{theme.name}</Text>;
}

describe('système de thèmes', () => {
  it('expose les 3 ambiances du design dans les 2 schémas', () => {
    expect(ambianceNames).toEqual(['sauge', 'terracotta', 'brume']);
    expect(allThemes.map((t) => t.name)).toEqual([
      'sauge-light',
      'sauge-dark',
      'terracotta-light',
      'terracotta-dark',
      'brume-light',
      'brume-dark',
    ]);
  });

  it('expose exactement les mêmes rôles dans tous les thèmes', () => {
    // Garde-fou d'exécution en complément du typage : un rôle ajouté à une
    // ambiance et oublié dans une autre doit se voir immédiatement.
    const reference = Object.keys(themes[defaultAmbiance].light.colors).sort();

    for (const theme of allThemes) {
      expect(Object.keys(theme.colors).sort()).toEqual(reference);
      expect(Object.keys(theme.colors.tints).sort()).toEqual(['t1', 't2', 't3', 't4', 't5']);
      expect(Object.keys(theme.colors.character).sort()).toEqual([
        'hair',
        'pants',
        'shirt',
        'shoe',
        'skin',
      ]);
    }
  });

  it("n'expose aucune couleur invalide", () => {
    const flatten = (input: object): string[] =>
      Object.values(input).flatMap((value) =>
        typeof value === 'object' && value !== null ? flatten(value) : [String(value)],
      );

    for (const theme of allThemes) {
      for (const value of flatten(theme.colors)) {
        expect(value).toMatch(/^(#[0-9a-f]{6}|rgba?\()/i);
      }
    }
  });

  it('habille le personnage avec l’accent de son ambiance', () => {
    // Règle explicite du design : l'identité du personnage est constante,
    // seul le t-shirt suit l'accent.
    for (const theme of allThemes) {
      expect(theme.colors.character.shirt).toBe(theme.colors.accent);
      expect(theme.colors.character.hair).toBe('#2b3340');
    }
  });

  it('met les mesures du design à l’échelle de l’appareil', () => {
    // Le design est maquetté dans un cadre de 300 px de large : sans mise à
    // l'échelle, l'interface serait 25 % trop petite sur appareil réel.
    const { typography, radius } = themes[defaultAmbiance].light;

    expect(typography.body.fontSize).toBe(16.5); // 13 px du design
    expect(typography.h1.fontSize).toBe(31.5); // 25 px du design
    expect(radius.lg).toBe(25); // --radius-lg: 20px
    expect(radius.pill).toBe(999);
  });

  it('retombe sur l’ambiance par défaut en clair sans provider', () => {
    // Contrat indispensable : les tests d'écrans rendent les composants isolés,
    // sans ThemeProvider au-dessus.
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent(`${defaultAmbiance}-light`);
  });

  it('applique le mode et l’ambiance demandés au provider', () => {
    render(
      <ThemeProvider initialMode="dark" initialAmbiance="terracotta" persist={false}>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('terracotta-dark');
  });

  it('démarre en clair par défaut tant que les écrans ne sont pas migrés', () => {
    render(
      <ThemeProvider persist={false}>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent(`${defaultAmbiance}-light`);
  });

  it('mémoïse la feuille de styles par thème', () => {
    const factory = jest.fn((theme: Theme) => ({
      box: { backgroundColor: theme.colors.surface },
    }));
    const useStyles = makeStyles(factory);

    function Box() {
      const styles = useStyles();
      return <View testID="box" style={styles.box} />;
    }

    const { rerender } = render(<Box />);
    rerender(<Box />);
    rerender(<Box />);

    // Une seule construction malgré trois rendus, et zéro par instance.
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('projette chaque thème vers React Navigation', () => {
    for (const theme of allThemes) {
      const nav = toNavigationTheme(theme);

      expect(nav.dark).toBe(theme.scheme === 'dark');
      expect(nav.colors.background).toBe(theme.colors.bg);
      expect(nav.colors.primary).toBe(theme.colors.accent);
      expect(nav.colors.text).toBe(theme.colors.ink);
      // React Navigation 7 exige une clé `fonts` : elle doit survivre au mapping.
      expect(nav.fonts).toBeDefined();
    }
  });

  it('conserve la teinte de marque entre clair et sombre', () => {
    // Le sombre est dérivé, pas repris du design : on vérifie qu'il éclaircit
    // l'accent au lieu de le remplacer, et qu'il inverse bien `onAccent`.
    for (const ambiance of ambianceNames as AmbianceName[]) {
      const light = getTheme(ambiance, 'light');
      const dark = getTheme(ambiance, 'dark');

      expect(dark.colors.accent).not.toBe(light.colors.accent);
      expect(light.colors.onAccent).toBe('#ffffff');
      expect(dark.colors.onAccent).toBe(dark.colors.bg);
    }
  });
});
