import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';

import { ThemeProvider, darkTheme, lightTheme, makeStyles, toNavigationTheme, useTheme } from '@/theme';

// Le repo fournit un mock manuel global de `@react-navigation/native`
// (`__mocks__/@react-navigation/native.tsx`) que Jest applique automatiquement
// et qui n'exporte que `useNavigation` / `useRoute`. Le pont de thème s'appuie
// sur `DefaultTheme` / `DarkTheme` : on exerce donc le vrai module.
jest.unmock('@react-navigation/native');

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

function Probe() {
  const theme = useTheme();
  return <Text testID="probe">{theme.name}</Text>;
}

describe('système de thèmes', () => {
  it('expose exactement les mêmes rôles de couleur en clair et en sombre', () => {
    // Garde-fou d'exécution en complément du typage : un rôle ajouté au clair
    // et oublié au sombre doit se voir immédiatement.
    expect(Object.keys(darkTheme.colors).sort()).toEqual(Object.keys(lightTheme.colors).sort());
    expect(Object.keys(darkTheme.colors.tints).sort()).toEqual(
      Object.keys(lightTheme.colors.tints).sort(),
    );
    expect(Object.keys(darkTheme.colors.character).sort()).toEqual(
      Object.keys(lightTheme.colors.character).sort(),
    );
  });

  it("n'expose aucune couleur vide", () => {
    const flatten = (input: object): string[] =>
      Object.values(input).flatMap((value) =>
        typeof value === 'object' && value !== null ? flatten(value) : [String(value)],
      );

    for (const theme of [lightTheme, darkTheme]) {
      for (const value of flatten(theme.colors)) {
        expect(value).toMatch(/^(#|rgba?\()/);
      }
    }
  });

  it('retombe sur le thème clair sans provider', () => {
    // Contrat indispensable : les tests d'écrans rendent les composants isolés,
    // sans ThemeProvider au-dessus.
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('sauge-light');
  });

  it('applique le mode demandé au provider', () => {
    render(
      <ThemeProvider initialMode="dark" persist={false}>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('sauge-dark');
  });

  it('démarre en clair par défaut tant que les écrans ne sont pas migrés', () => {
    render(
      <ThemeProvider persist={false}>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('sauge-light');
  });

  it('mémoïse la feuille de styles par thème', () => {
    const factory = jest.fn((theme: typeof lightTheme) => ({
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

    // Une seule construction malgré trois rendus, et zéro construction par instance.
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('projette le thème vers React Navigation', () => {
    const nav = toNavigationTheme(darkTheme);

    expect(nav.dark).toBe(true);
    expect(nav.colors.background).toBe(darkTheme.colors.bg);
    expect(nav.colors.primary).toBe(darkTheme.colors.accent);
    expect(nav.colors.text).toBe(darkTheme.colors.ink);
    // React Navigation 7 exige une clé `fonts` : elle doit survivre au mapping.
    expect(nav.fonts).toBeDefined();
  });
});
