import type { ThemeFonts, ThemeTypography } from '../types';

import { em, px } from './scale';

/**
 * Familles typographiques du design : **Lexend** pour l'affichage
 * (`--font-display`), **Atkinson Hyperlegible** pour le corps (`--font-body`).
 *
 * Une famille par graisse, et non une famille avec `fontWeight` : React Native
 * ne sait pas dériver une graisse, et sur Android une déclaration
 * `fontFamily: 'Lexend'` + `fontWeight: '600'` rend du 400. Les quatre instances
 * de Lexend sont extraites de sa version variable ; Atkinson n'existe qu'en
 * deux graisses, ses valeurs intermédiaires retombent donc sur la plus proche.
 *
 * Ces noms doivent correspondre exactement aux clés passées à `useFonts` dans
 * `app/_layout.tsx`.
 */
const LEXEND = Object.freeze({
  '400': 'Lexend-Regular',
  '500': 'Lexend-Medium',
  '600': 'Lexend-SemiBold',
  '700': 'Lexend-Bold',
});

const ATKINSON = Object.freeze({
  '400': 'AtkinsonHyperlegible-Regular',
  // Atkinson Hyperlegible ne fournit ni 500 ni 600 : l'emphase passe au gras,
  // ce qui reste l'intention du design pour du texte de corps accentué.
  '500': 'AtkinsonHyperlegible-Regular',
  '600': 'AtkinsonHyperlegible-Bold',
  '700': 'AtkinsonHyperlegible-Bold',
});

export const fonts: Readonly<ThemeFonts> = Object.freeze({
  display: LEXEND,
  body: ATKINSON,
  mono: 'SpaceMono',
  weights: Object.freeze({
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }),
});

/**
 * `fontWeight` est conservé à côté de `fontFamily` : si une police n'a pas fini
 * de charger, le rendu retombe sur la police système à la bonne graisse plutôt
 * que sur un texte uniformément maigre.
 */
const display = (weight: keyof typeof LEXEND) => ({
  fontFamily: LEXEND[weight],
  fontWeight: weight,
});

const body = (weight: keyof typeof ATKINSON) => ({
  fontFamily: ATKINSON[weight],
  fontWeight: weight,
});

const h1Size = px(25);
const h2Size = px(17);
const h3Size = px(14);
const metaSize = px(10);
const numSize = px(46);

/**
 * Barème typographique, transcrit des classes du design puis mis à l'échelle.
 * Le design réserve Lexend aux titres, libellés et chiffres, et Atkinson au
 * texte courant.
 */
export const typography: ThemeTypography = Object.freeze({
  /** `.pa-h1` — 25 px / 1.08 / 600 / -0.015em. */
  h1: {
    ...display('600'),
    fontSize: h1Size,
    lineHeight: Math.round(h1Size * 1.08),
    letterSpacing: em(-0.015, h1Size),
  },
  /** `.pa-h2` — 17 px / 600 / -0.01em. */
  h2: {
    ...display('600'),
    fontSize: h2Size,
    lineHeight: Math.round(h2Size * 1.25),
    letterSpacing: em(-0.01, h2Size),
  },
  /** `.pa-h3` — 14 px / 600. */
  h3: {
    ...display('600'),
    fontSize: h3Size,
    lineHeight: Math.round(h3Size * 1.3),
  },
  /** `.pa-sub` — 12.5 px, à colorer en `ink2`. */
  sub: { ...body('400'), fontSize: px(12.5), lineHeight: Math.round(px(12.5) * 1.35) },
  /** `.pa-phone` — corps de texte, 13 px / 1.35. */
  body: { ...body('400'), fontSize: px(13), lineHeight: Math.round(px(13) * 1.35) },
  bodyStrong: { ...body('600'), fontSize: px(13), lineHeight: Math.round(px(13) * 1.35) },
  bodySm: { ...body('400'), fontSize: px(11.5), lineHeight: Math.round(px(11.5) * 1.4) },
  /** `.pa-chip` — 11 px / 500. */
  label: { ...display('500'), fontSize: px(11), lineHeight: Math.round(px(11) * 1.4) },
  /** `.pa-meta` — 10 px / 600 / +0.04em / capitales, à colorer en `muted`. */
  meta: {
    ...display('600'),
    fontSize: metaSize,
    lineHeight: Math.round(metaSize * 1.3),
    letterSpacing: em(0.04, metaSize),
    textTransform: 'uppercase',
  },
  /** `.pa-tag` / `.pa-tab` — 9.5 px. */
  caption: { ...display('500'), fontSize: px(9.5), lineHeight: Math.round(px(9.5) * 1.4) },
  /** `.pa-btn` — 13 px / 600. */
  button: { ...display('600'), fontSize: px(13), lineHeight: Math.round(px(13) * 1.25) },
  /** `.pa-btn-lg` — 14 px / 600. */
  buttonLg: { ...display('600'), fontSize: px(14), lineHeight: Math.round(px(14) * 1.25) },
  /**
   * `.pa-num` — grands chiffres. Le design ajoute
   * `font-variant-numeric: tabular-nums`, dont `fontVariant` s'approche.
   */
  num: {
    ...display('600'),
    fontSize: numSize,
    lineHeight: numSize,
    letterSpacing: em(-0.02, numSize),
    fontVariant: ['tabular-nums'],
  },
});
