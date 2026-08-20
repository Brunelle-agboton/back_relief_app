import { amber, blue, character, neutral, red, sage, scrim, tints } from '../tokens/palette';
import { createShadows } from '../tokens/shadows';
import { fonts, typography } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import type { Theme } from '../types';

/**
 * Ambiance « sauge », schéma sombre.
 *
 * Le typage `Theme` garantit qu'aucun rôle n'est oublié : ajouter une clé à
 * `ThemeColors` casse la compilation ici tant que le sombre n'est pas complété.
 *
 * Deux inversions à noter : `onAccent` passe au sombre (l'accent s'éclaircit
 * pour rester lisible sur fond noir, donc son texte doit foncer), et
 * `accentDeep` — qui sert au *texte* de marque — devient plus **clair** que
 * `accent`, à l'inverse du schéma clair.
 */
export const darkTheme: Theme = Object.freeze({
  name: 'sauge-dark',
  scheme: 'dark',
  statusBarStyle: 'light',
  spacing,
  radius,
  fonts,
  typography,
  shadows: createShadows('dark'),
  colors: Object.freeze({
    bg: neutral[1000],
    surface: '#161C18',
    surfaceSoft: '#1C241E',
    surfaceRaised: '#222B25',
    overlay: scrim.dark,

    ink: '#E9EFEA',
    ink2: '#B0BEB5',
    muted: '#869189',
    onAccent: neutral[1000],

    accent: '#7FB98D',
    accentDeep: '#A6D4B0',
    accentSoft: '#22301F',

    line: '#2A342D',
    lineStrong: '#3A473E',
    focus: '#7FB98D',

    danger: red.soft,
    dangerSoft: '#3A211E',
    onDanger: neutral[1000],
    warn: amber[300],
    warnSoft: '#332818',
    success: '#7FB98D',
    successSoft: '#22301F',
    info: blue[300],
    infoSoft: '#1B2833',

    field: '#1C241E',
    fieldDisabled: '#20281F',

    tints: tints.dark,
    character: Object.freeze({ ...character, shirt: '#7FB98D' }),
    tabBar: Object.freeze({
      bg: '#161C18',
      border: '#2A342D',
      active: '#A6D4B0',
      inactive: '#869189',
    }),
  }),
});
