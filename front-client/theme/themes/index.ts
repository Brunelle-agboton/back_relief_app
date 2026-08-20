import type { ColorScheme, Theme } from '../types';

import { darkTheme } from './dark';
import { lightTheme } from './light';

export { darkTheme } from './dark';
export { lightTheme } from './light';

export const themes: Readonly<Record<ColorScheme, Theme>> = Object.freeze({
  light: lightTheme,
  dark: darkTheme,
});

/** Thème appliqué tant qu'aucun `ThemeProvider` n'est monté (tests unitaires). */
export const defaultTheme = lightTheme;

export function getTheme(scheme: ColorScheme): Theme {
  return themes[scheme];
}
