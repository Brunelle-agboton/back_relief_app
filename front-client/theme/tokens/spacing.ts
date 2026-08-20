import type { ThemeRadius, ThemeSpacing } from '../types';

/** Échelle d'espacement 4pt — la seule autorisée pour marges et gouttières. */
export const spacing: Readonly<ThemeSpacing> = Object.freeze({
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
});

/** Rayons d'arrondi. `pill` s'appuie sur une valeur volontairement très haute. */
export const radius: Readonly<ThemeRadius> = Object.freeze({
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  pill: 999,
});
