import type { ThemeRadius, ThemeSpacing } from '../types';

import { px } from './scale';

/**
 * Échelle d'espacement, calée sur le rythme du design une fois mis à l'échelle
 * (cf. `scale.ts`) :
 *
 * | design | mis à l'échelle | clé  | usage dans la maquette              |
 * |--------|-----------------|------|-------------------------------------|
 * |   4 px |          5 pt   | `xs` | `.pa-col` serré, gouttière d'icône  |
 * |   6 px |        7.5 pt   | `sm` | `.pa-chip` vertical, `.pa-screen` haut |
 * |  10 px |       12.5 pt   | `md` | `.pa-row`, `.pa-col`, `.pa-grid2`   |
 * |  13 px |      16.25 pt   | `lg` | gouttière verticale d'écran         |
 * |  16 px |         20 pt   | `xl` | marge horizontale d'écran           |
 * |  22 px |       27.5 pt   | `xxl`| respiration de bottom sheet         |
 *
 * Les clés sont arrondies à une échelle 4pt cohérente : l'écart au design
 * n'excède jamais 1.5 pt, pour un rythme bien plus tenable à l'usage.
 */
export const spacing: Readonly<ThemeSpacing> = Object.freeze({
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
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
