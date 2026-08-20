import type { ThemeFonts, ThemeTypography } from '../types';

/**
 * Familles et graisses.
 *
 * Choix assumé : on s'appuie sur les **polices système** (San Francisco sur
 * iOS, Roboto sur Android) plutôt que sur Inter/Urbanist. Les écrans existants
 * référencent déjà `fontFamily: 'Urbanist'` / `'Inter-Bold'` sans que ces
 * polices soient chargées — seul `SpaceMono` l'est dans `app/_layout.tsx` —, ce
 * qui produit aujourd'hui un repli silencieux vers la police système.
 *
 * On garde `fontFamily` à `undefined` (et non `'System'` / `'sans-serif'`) :
 * sur Android, forcer la famille désactive la sélection automatique de la
 * fonte selon `fontWeight`. Le barème ci-dessous joue donc uniquement sur la
 * graisse, ce qui reste fidèle à la hiérarchie du design.
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

/**
 * Barème typographique, calqué sur les classes du design :
 * `pa-h1`, `pa-h3`, `pa-sub`, `pa-meta`, `pa-num`.
 */
export const typography: ThemeTypography = Object.freeze({
  h1: { fontSize: 28, lineHeight: 34, fontWeight: fonts.weights.bold, letterSpacing: -0.4 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: fonts.weights.bold, letterSpacing: -0.3 },
  h3: { fontSize: 17, lineHeight: 23, fontWeight: fonts.weights.semibold, letterSpacing: -0.2 },
  sub: { fontSize: 15, lineHeight: 21, fontWeight: fonts.weights.regular },
  body: { fontSize: 15, lineHeight: 22, fontWeight: fonts.weights.regular },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: fonts.weights.semibold },
  bodySm: { fontSize: 13, lineHeight: 19, fontWeight: fonts.weights.regular },
  label: { fontSize: 14, lineHeight: 18, fontWeight: fonts.weights.medium },
  /** `pa-meta` : petites capitales espacées, pour les sur-titres. */
  meta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: fonts.weights.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: fonts.weights.regular },
  button: { fontSize: 16, lineHeight: 20, fontWeight: fonts.weights.semibold, letterSpacing: 0.1 },
  /** `pa-num` : grands chiffres (compte à rebours, statistiques). */
  num: { fontSize: 44, lineHeight: 48, fontWeight: fonts.weights.bold, letterSpacing: -1 },
});
