import type { ThemeRadius, ThemeSpacing } from '../types';

import { px } from './scale';

/**
 * Échelle d'espacement du design system — section « Espacement » :
 * XS 8 · SM 12 · MD 16 · LG 20 · XL 24 · 2XL 32, base 4 pt.
 *
 * Ces valeurs sont déjà en points d'appareil et ne passent **pas** par `px()`.
 * Les paddings relevés sur la maquette (11/18 pour un bouton, 12/14 pour un
 * champ) sont eux des mesures d'artboard : ils continuent d'être mis à
 * l'échelle. Confondre les deux donnerait un rythme incohérent.
 *
 * `xxs` et `xxxl` prolongent l'échelle aux deux extrémités pour les cas que le
 * design utilise sans les nommer.
 */
export const spacing: Readonly<ThemeSpacing> = Object.freeze({
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
});

/** Rayons du design : `--radius`, `--radius-lg`, `--radius-pill`. */
export const radius: Readonly<ThemeRadius> = Object.freeze({
  none: 0,
  /** `.pa-tag` — 6 px dans le design. */
  xs: px(6),
  sm: px(10),
  /** `--radius` — 14 px. */
  md: px(14),
  /** `--radius-lg` — 20 px, rayon des cartes. */
  lg: px(20),
  /** `.pa-sheet` — 24 px. */
  xl: px(24),
  /** `--radius-pill`. */
  pill: 999,
});
