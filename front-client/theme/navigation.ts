import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import type { Theme as NavigationTheme } from '@react-navigation/native';

import type { Theme } from './types';

/**
 * Projette un thème applicatif vers le thème de React Navigation, qui pilote
 * les couleurs des en-têtes, des fonds d'écran et des transitions.
 *
 * On repart de `DefaultTheme` / `DarkTheme` plutôt que de composer l'objet à la
 * main : React Navigation 7 a introduit une clé `fonts` dans son contrat, et
 * l'étendre ainsi laisse les valeurs par défaut à jour sans nous y coupler.
 */
export function toNavigationTheme(theme: Theme): NavigationTheme {
  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    dark: theme.scheme === 'dark',
    colors: {
      ...base.colors,
      primary: theme.colors.accent,
      background: theme.colors.bg,
      card: theme.colors.surface,
      text: theme.colors.ink,
      border: theme.colors.line,
      notification: theme.colors.danger,
    },
  };
}
