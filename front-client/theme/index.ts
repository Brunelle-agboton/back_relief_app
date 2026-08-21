/**
 * Point d'entrée unique du système de thèmes.
 *
 *     import { makeStyles, useTheme } from '@/theme';
 *
 * Rien d'autre ne doit être importé depuis les sous-dossiers `tokens/` ou
 * `themes/` par les écrans : ils consomment le thème, jamais les valeurs.
 */
export { ThemeProvider, useTheme, useThemeController } from './ThemeContext';
export type { ThemeContextValue, ThemeProviderProps } from './ThemeContext';
export { makeStyles } from './makeStyles';
export { toNavigationTheme } from './navigation';
export { ambianceNames, createTheme, defaultTheme, getTheme, themes } from './themes';
export { defaultAmbiance } from './tokens/ambiances';
// Mise à l'échelle des mesures du design : utile aux primitives d'interface,
// qui transcrivent des valeurs de la maquette. Les écrans, eux, s'appuient sur
// `theme.spacing` et `theme.radius`.
export { DESIGN_SCALE, px } from './tokens/scale';
export type {
  AmbianceName,
  CharacterPart,
  ColorScheme,
  FontWeightToken,
  Theme,
  ThemeColors,
  ThemeFonts,
  ThemeMode,
  ThemeRadius,
  ThemeShadows,
  ThemeSpacing,
  ThemeTypography,
  TintName,
  TypographyVariant,
} from './types';
