import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Contrat du système de thèmes.
 *
 * Les rôles reprennent un pour un les variables CSS du design « Pause Active ×
 * Companion » (`--accent`, `--accent-deep`, `--accent-soft`, `--ink`,
 * `--ink-2`, `--muted`, `--line`, `--bg`, `--surface`, `--good`, `--warn`,
 * `--danger`, `--streak`, `--streak-bg`, `--t1`…`--t5`, `--char-*`). Une mise à
 * jour du design se traduit donc par l'édition de `tokens/ambiances.ts` seul.
 */

/** Les trois ambiances définies par le design. */
export type AmbianceName = 'sauge' | 'terracotta' | 'brume';

export type ColorScheme = 'light' | 'dark';

/** Préférence utilisateur : un schéma figé, ou le suivi du réglage système. */
export type ThemeMode = ColorScheme | 'system';

/** Teintes des vignettes de catégorie (`--t1` … `--t5`). */
export type TintName = 't1' | 't2' | 't3' | 't4' | 't5';

/** Pièces du personnage illustré (`--char-*`). */
export type CharacterPart = 'skin' | 'hair' | 'shirt' | 'pants' | 'shoe';

export interface ThemeColors {
  /** `--bg` — fond d'écran général, sous les cartes. */
  bg: string;
  /** `--surface` — surface d'une carte posée sur `bg`. */
  surface: string;
  /** `.pa-card-soft` — carte teintée à l'accent (mise en avant douce). */
  surfaceSoft: string;
  /** Surface surélevée : bottom sheet, modale. */
  surfaceRaised: string;
  /** `.pa-scrim` — voile derrière une modale. */
  overlay: string;

  /** `--ink` — texte principal. */
  ink: string;
  /** `--ink-2` — texte secondaire. */
  ink2: string;
  /** `--muted` — texte tertiaire, sur-titres, libellés d'onglet inactifs. */
  muted: string;
  /** Texte et icônes posés sur `accent`. Bascule selon le schéma. */
  onAccent: string;

  /** `--accent` — aplats de marque : bouton primaire, jauges, anneaux. */
  accent: string;
  /** `--accent-deep` — variante contrastée, pour le texte de marque. */
  accentDeep: string;
  /** `--accent-soft` — aplat très clair : puces de catégorie, bouton doux. */
  accentSoft: string;

  /** `--line` — bordures, séparateurs, contours en `inset`. */
  line: string;
  /** Bordure d'un champ actif, halo de focus. */
  focus: string;

  /** `--good` — validation, réussite. */
  good: string;
  goodSoft: string;
  /** `--warn` — avertissement. */
  warn: string;
  warnSoft: string;
  /** `--danger` — erreur, action destructive. */
  danger: string;
  dangerSoft: string;
  onDanger: string;

  /** `--streak` / `--streak-bg` — pastille de série de jours. */
  streak: string;
  streakBg: string;

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
  /** `--radius` du design. */
  md: number;
  /** `--radius-lg` du design — rayon des cartes. */
  lg: number;
  /** Rayon des bottom sheets. */
  xl: number;
  /** `--radius-pill` — boutons, puces, pastilles. */
  pill: number;
}

export interface ThemeFonts {
  /**
   * Familles typographiques. `undefined` = police système de la plateforme.
   *
   * Le design s'appuie sur Lexend (display) et Atkinson Hyperlegible (corps),
   * deux polices non embarquées dans l'app. Le jour où elles le seront, il
   * suffit de renseigner ces clés et de les charger dans `useFonts`.
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
  | 'buttonLg'
  | 'num';

export type ThemeTypography = Readonly<Record<TypographyVariant, TextStyle>>;

export type ThemeShadows = Readonly<{
  none: ViewStyle;
  /** `--shadow-card`. */
  card: ViewStyle;
  /** Élévation intermédiaire : bouton primaire, segment actif. */
  raised: ViewStyle;
  /** `--shadow-pop` — modales. */
  pop: ViewStyle;
}>;

export interface Theme {
  /** Identifiant lisible, ex. `brume-light`. Utile en debug et en snapshot. */
  readonly name: string;
  readonly ambiance: AmbianceName;
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
