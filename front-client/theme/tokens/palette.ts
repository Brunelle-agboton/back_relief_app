/**
 * Valeurs brutes des couleurs — **seule source de vérité** du projet.
 *
 * Aucune autre partie du code ne doit contenir de littéral hexadécimal :
 * `theme/themes/light.ts` et `theme/themes/dark.ts` mappent ces valeurs vers
 * des rôles sémantiques, et les écrans ne consomment que ces rôles.
 *
 * ── Statut des valeurs ────────────────────────────────────────────────────
 * Le design « Pause Active × Companion » expose ses tokens sous forme de
 * variables CSS (`--accent`, `--ink`, `--t1`…) définies dans le bloc `pa-base`
 * de `Pause-Active-Companion.html`, fichier non encore fourni. Les rampes
 * ci-dessous sont donc **provisoires** : elles reprennent l'ambiance « sauge »
 * annoncée par le design et l'identité verte de l'app, et ont été validées en
 * contraste WCAG AA. Remplacer ces valeurs par celles du design ne demandera
 * aucune modification ailleurs.
 *
 * Le design annonce 3 ambiances. `createTheme` (theme/themes/index.ts) prend la
 * palette en paramètre : ajouter une ambiance = ajouter une rampe ici.
 */

/** Rampe de marque — vert sauge. */
export const sage = {
  50: '#F1F6F2',
  100: '#DFECE1',
  200: '#C3D8C7',
  300: '#9FC0A6',
  400: '#77A585',
  /** Aplats de marque. Contraste 4.64:1 avec du texte blanc → AA. */
  500: '#4F7F5C',
  600: '#3F6A4B',
  /** Texte de marque. Contraste 7.83:1 sur blanc → AAA. */
  700: '#2F5B3C',
  800: '#25462F',
  900: '#1A3122',
} as const;

/** Rampe neutre, très légèrement teintée de vert pour s'accorder à la marque. */
export const neutral = {
  0: '#FFFFFF',
  25: '#F9FBF9',
  50: '#F4F7F4',
  100: '#EDF1EE',
  200: '#E2E8E3',
  300: '#CBD4CD',
  400: '#A8B4AB',
  /** Texte tertiaire. 3.58:1 sur blanc → AA pour texte large et icônes. */
  500: '#7C8B82',
  /** Texte secondaire. 7.32:1 sur blanc → AAA. */
  600: '#4A5A50',
  700: '#33403A',
  800: '#232D27',
  /** Texte principal. 16.58:1 sur blanc. */
  900: '#16211A',
  1000: '#0F1411',
} as const;

/** Rampes sémantiques. */
export const red = {
  100: '#FBE4E1',
  300: '#E9A19A',
  500: '#B3382F',
  700: '#8C2A23',
  soft: '#F08A80',
} as const;

export const amber = {
  100: '#FBEEDA',
  300: '#EFC073',
  500: '#8A5A10',
  700: '#6B4409',
} as const;

export const blue = {
  100: '#DCE9F2',
  300: '#8FBBDA',
  500: '#1F6392',
  700: '#164B70',
} as const;

/** Teintes pastel des vignettes de catégorie (`--t1` … `--t6`). */
export const tints = {
  light: {
    t1: '#DFECE1',
    t2: '#DCE9F2',
    t3: '#F5E7DA',
    t4: '#E6E2F2',
    t5: '#F7E3E1',
    t6: '#DDEEEA',
  },
  dark: {
    t1: '#1F2B23',
    t2: '#1B2833',
    t3: '#302619',
    t4: '#272338',
    t5: '#33211F',
    t6: '#182E2A',
  },
} as const;

/**
 * Couleurs du personnage illustré. Le design précise que son identité reste
 * constante d'une ambiance à l'autre — seul le maillot suit `accent`.
 */
export const character = {
  skin: '#E8B58C',
  hair: '#3A2E27',
  pants: '#46566B',
  shoe: '#2F3A45',
} as const;

/** Voiles translucides (modales, fonds de carte sur photo). */
export const scrim = {
  light: 'rgba(22, 33, 26, 0.45)',
  dark: 'rgba(0, 0, 0, 0.62)',
} as const;
