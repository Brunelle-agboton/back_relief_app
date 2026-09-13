import { ambiances, characterBase } from '../tokens/ambiances';
import { createShadows } from '../tokens/shadows';
import { fonts, typography } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import type { AmbianceName, ColorScheme, Theme } from '../types';

/**
 * Assemble un thème à partir d'une ambiance et d'un schéma.
 *
 * Les rôles dérivés — personnage et barre d'onglets — sont calculés ici plutôt
 * que dupliqués dans chaque ambiance, en suivant les règles du design :
 * le t-shirt du personnage suit `accent`, l'onglet actif prend `accent-deep`
 * et l'onglet inactif `muted` (`.pa-tab` / `.pa-tab.on`).
 */
export function createTheme(ambiance: AmbianceName, scheme: ColorScheme): Theme {
  const c = ambiances[ambiance][scheme];

  return Object.freeze({
    name: `${ambiance}-${scheme}`,
    ambiance,
    scheme,
    statusBarStyle: scheme === 'dark' ? 'light' : 'dark',
    spacing,
    radius,
    fonts,
    typography,
    shadows: createShadows(scheme),
    colors: Object.freeze({
      bg: c.bg,
      surface: c.surface,
      surfaceSoft: c.surfaceSoft,
      surfaceRaised: c.surfaceRaised,
      overlay: c.overlay,

      ink: c.ink,
      ink2: c.ink2,
      muted: c.muted,
      onAccent: c.onAccent,

      accent: c.accent,
      accentDeep: c.accentDeep,
      accentSoft: c.accentSoft,

      line: c.line,
      focus: c.accent,

      good: c.good,
      goodDeep: c.goodDeep,
      goodSoft: c.goodSoft,
      onGood: c.onGood,
      warn: c.warn,
      warnSoft: c.warnSoft,
      danger: c.danger,
      dangerDeep: c.dangerDeep,
      dangerSoft: c.dangerSoft,
      onDanger: c.onDanger,

      streak: c.streak,
      streakBg: c.streakBg,

      field: c.field,
      fieldDisabled: c.fieldDisabled,

      tints: c.tints,
      character: Object.freeze({
        ...characterBase,
        pants: c.charPants,
        shirt: c.accent,
      }),
      tabBar: Object.freeze({
        bg: c.surface,
        border: c.line,
        active: c.accentDeep,
        inactive: c.muted,
      }),
    }),
  });
}
