import { amber, blue, character, neutral, red, sage, scrim, tints } from '../tokens/palette';
import { createShadows } from '../tokens/shadows';
import { fonts, typography } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import type { Theme } from '../types';

/** Ambiance « sauge », schéma clair. */
export const lightTheme: Theme = Object.freeze({
  name: 'sauge-light',
  scheme: 'light',
  statusBarStyle: 'dark',
  spacing,
  radius,
  fonts,
  typography,
  shadows: createShadows('light'),
  colors: Object.freeze({
    bg: neutral[50],
    surface: neutral[0],
    surfaceSoft: sage[50],
    surfaceRaised: neutral[0],
    overlay: scrim.light,

    ink: neutral[900],
    ink2: neutral[600],
    muted: neutral[500],
    onAccent: neutral[0],

    accent: sage[500],
    accentDeep: sage[700],
    accentSoft: sage[100],

    line: neutral[200],
    lineStrong: neutral[300],
    focus: sage[500],

    danger: red[500],
    dangerSoft: red[100],
    onDanger: neutral[0],
    warn: amber[500],
    warnSoft: amber[100],
    success: sage[600],
    successSoft: sage[100],
    info: blue[500],
    infoSoft: blue[100],

    field: neutral[25],
    fieldDisabled: neutral[100],

    tints: tints.light,
    character: Object.freeze({ ...character, shirt: sage[500] }),
    tabBar: Object.freeze({
      bg: neutral[0],
      border: neutral[200],
      active: sage[700],
      inactive: neutral[500],
    }),
  }),
});
