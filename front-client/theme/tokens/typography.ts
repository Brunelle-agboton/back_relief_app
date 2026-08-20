import type { ThemeFonts, ThemeTypography } from '../types';

import { em, px } from './scale';

/**
 * Familles et graisses.
 *
 * Le design s'appuie sur **Lexend** (`--font-display`) et **Atkinson
 * Hyperlegible** (`--font-body`), cette dernière étant une police conçue pour
 * la lisibilité. Aucune des deux n'est embarquée dans l'app : on s'appuie donc
 * sur les polices système (San Francisco, Roboto) avec un barème de graisses
 * équivalent — le design n'utilise que 400 / 500 / 600 / 700.
 *
 * `fontFamily` est laissé à `undefined` plutôt que forcé à `'System'` ou
 * `'sans-serif'` : sur Android, fixer la famille désactive la sélection
 * automatique de la fonte correspondant à `fontWeight`. Embarquer Lexend et
 * Atkinson plus tard se réduira à renseigner ces deux clés et à les charger
 * dans `useFonts` (`app/_layout.tsx`).
 */
export const fonts: Readonly<ThemeFonts> = Object.freeze({
  display: undefined,
  body: undefined,
  mono: 'SpaceMono',
  weights: Object.freeze({
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }),
});

const h1Size = px(25);
const h2Size = px(17);
const h3Size = px(14);
const metaSize = px(10);
const numSize = px(46);

/**
 * Barème typographique, transcrit des classes du design puis mis à l'échelle.
 * Les `letter-spacing` du design sont exprimés en `em` et convertis en points.
 */
export const typography: ThemeTypography = Object.freeze({
  /** `.pa-h1` — 25 px / 1.08 / 600 / -0.015em. */
  h1: {
    fontSize: h1Size,
    lineHeight: Math.round(h1Size * 1.08),
    fontWeight: fonts.weights.semibold,
    letterSpacing: em(-0.015, h1Size),
  },
  /** `.pa-h2` — 17 px / 600 / -0.01em. */
  h2: {
    fontSize: h2Size,
    lineHeight: Math.round(h2Size * 1.25),
    fontWeight: fonts.weights.semibold,
    letterSpacing: em(-0.01, h2Size),
  },
  /** `.pa-h3` — 14 px / 600. */
  h3: {
    fontSize: h3Size,
    lineHeight: Math.round(h3Size * 1.3),
    fontWeight: fonts.weights.semibold,
  },
  /** `.pa-sub` — 12.5 px, à colorer en `ink2`. */
  sub: { fontSize: px(12.5), lineHeight: Math.round(px(12.5) * 1.35), fontWeight: fonts.weights.regular },
  /** `.pa-phone` — corps de texte, 13 px / 1.35. */
  body: { fontSize: px(13), lineHeight: Math.round(px(13) * 1.35), fontWeight: fonts.weights.regular },
  bodyStrong: { fontSize: px(13), lineHeight: Math.round(px(13) * 1.35), fontWeight: fonts.weights.semibold },
  bodySm: { fontSize: px(11.5), lineHeight: Math.round(px(11.5) * 1.4), fontWeight: fonts.weights.regular },
  /** `.pa-chip` — 11 px / 500. */
  label: { fontSize: px(11), lineHeight: Math.round(px(11) * 1.4), fontWeight: fonts.weights.medium },
  /** `.pa-meta` — 10 px / 600 / +0.04em / capitales, à colorer en `muted`. */
  meta: {
    fontSize: metaSize,
    lineHeight: Math.round(metaSize * 1.3),
    fontWeight: fonts.weights.semibold,
    letterSpacing: em(0.04, metaSize),
    textTransform: 'uppercase',
  },
  /** `.pa-tag` / `.pa-tab` — 9.5 px. */
  caption: { fontSize: px(9.5), lineHeight: Math.round(px(9.5) * 1.4), fontWeight: fonts.weights.medium },
  /** `.pa-btn` — 13 px / 600. */
  button: { fontSize: px(13), lineHeight: Math.round(px(13) * 1.25), fontWeight: fonts.weights.semibold },
  /** `.pa-btn-lg` — 14 px / 600. */
  buttonLg: { fontSize: px(14), lineHeight: Math.round(px(14) * 1.25), fontWeight: fonts.weights.semibold },
  /**
   * `.pa-num` — grands chiffres. Le design l'utilise à 46 px dans l'écran
   * d'accueil, avec `font-variant-numeric: tabular-nums` — sans équivalent en
   * React Native, `fontVariant: ['tabular-nums']` s'en approche sur iOS.
   */
  num: {
    fontSize: numSize,
    lineHeight: numSize,
    fontWeight: fonts.weights.semibold,
    letterSpacing: em(-0.02, numSize),
    fontVariant: ['tabular-nums'],
  },
});
