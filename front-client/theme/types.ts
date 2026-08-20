import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Contrat du système de thèmes.
 *
 * Les noms de rôles reprennent volontairement le vocabulaire des tokens du
 * design « Pause Active × Companion » (`--accent`, `--accent-deep`, `--ink`,
 * `--ink-2`, `--muted`, `--line`, `--bg`, `--t1..t6`, `--char-*`) afin qu'une
 * mise à jour du design se traduise par un simple remappage de
 * `theme/tokens/palette.ts`, sans toucher au moindre écran.
 */

export type ColorScheme = 'light' | 'dark';

/** Préférence utilisateur : un schéma figé, ou le suivi du réglage système. */
export type ThemeMode = ColorScheme | 'system';

/** Teintes pastel des vignettes de catégorie (`--t1` … `--t6` côté design). */
export type TintName = 't1' | 't2' | 't3' | 't4' | 't5' | 't6';

/** Pièces du personnage illustré (`--char-*` côté design). */
export type CharacterPart = 'skin' | 'hair' | 'shirt' | 'pants' | 'shoe';

export interface ThemeColors {
  /** Fond d'écran général, sous les cartes. */
  bg: string;
  /** Surface d'une carte posée sur `bg`. */
  surface: string;
  /** Carte teintée (mise en avant douce). */
  surfaceSoft: string;
  /** Surface surélevée : modale, bottom sheet, popover. */
  surfaceRaised: string;
  /** Voile derrière une modale. */
  overlay: string;

  /** Texte principal. */
  ink: string;
  /** Texte secondaire. */
  ink2: string;
  /** Texte tertiaire, placeholders, libellés désactivés. */
  muted: string;
  /** Texte/icône posé sur `accent`. Bascule en clair/sombre selon le schéma. */
  onAccent: string;

  /** Couleur de marque, pour les aplats : boutons, jauges, anneaux. */
  accent: string;
  /** Variante contrastée de la marque, pour le texte et les grands chiffres. */
  accentDeep: string;
  /** Aplat de marque très clair : fonds de puces, états sélectionnés. */
  accentSoft: string;

  /** Bordures et séparateurs. */
  line: string;
  /** Bordure appuyée : champ au repos, contour de contrôle. */
  lineStrong: string;
  /** Bordure d'un champ actif, halo de focus. */
  focus: string;

  danger: string;
  dangerSoft: string;
  onDanger: string;
  warn: string;
  warnSoft: string;
  success: string;
  successSoft: string;
  info: string;
  infoSoft: string;

  /** Fond des champs de saisie. */
  field: string;
  /** Fond d'un champ désactivé. */
  fieldDisabled: string;

  tints: Readonly<Record<TintName, string>>;
  character: Readonly<Record<CharacterPart, string>>;
  tabBar: Readonly<{ bg: string; border: string; active: string; inactive: string }>;
}

export interface ThemeSpacing {
  none: 0;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface ThemeRadius {
  none: 0;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  /** Rayon « pilule » : boutons arrondis, puces, pastilles. */
  pill: number;
}

export interface ThemeFonts {
  /**
   * Familles typographiques. `undefined` = police système de la plateforme.
   * Le design prévoit une famille display distincte (`--font-display`) : le
   * jour où les fichiers de police sont embarqués, il suffit de renseigner ces
   * deux clés et de les charger dans `useFonts` (`app/_layout.tsx`).
   */
  display: string | undefined;
  body: string | undefined;
  mono: string;
  weights: Readonly<{
    regular: TextStyle['fontWeight'];
    medium: TextStyle['fontWeight'];
    semibold: TextStyle['fontWeight'];
    bold: TextStyle['fontWeight'];
  }>;
}

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'sub'
  | 'body'
  | 'bodyStrong'
  | 'bodySm'
  | 'label'
  | 'meta'
  | 'caption'
  | 'button'
  | 'num';

export type ThemeTypography = Readonly<Record<TypographyVariant, TextStyle>>;

export type ThemeShadows = Readonly<{
  none: ViewStyle;
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
}>;

export interface Theme {
  /** Identifiant lisible, ex. `sauge-light`. Utile en debug et en snapshot. */
  readonly name: string;
  readonly scheme: ColorScheme;
  readonly colors: ThemeColors;
  readonly spacing: Readonly<ThemeSpacing>;
  readonly radius: Readonly<ThemeRadius>;
  readonly fonts: Readonly<ThemeFonts>;
  readonly typography: ThemeTypography;
  readonly shadows: ThemeShadows;
  /** Valeur à passer à `<StatusBar style={...} />` d'expo-status-bar. */
  readonly statusBarStyle: 'light' | 'dark';
}
