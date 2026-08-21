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

  /**
   * `--good` — validation, réussite. **Couleur d'aplat, jamais de texte** : en
   * ambiance brume le design retient `#39DF87`, qui plafonne à 1.74:1 sur
   * blanc. Pour du texte, utiliser `goodDeep`.
   */
  good: string;
  /** Variante contrastée de `good`, pour le texte et les icônes. */
  goodDeep: string;
  goodSoft: string;
  /** Texte et icônes posés sur `good`. Varie selon l'ambiance. */
  onGood: string;
  /** `--warn` — avertissement. */
  warn: string;
  warnSoft: string;
  /** `--danger` — erreur, action destructive. Couleur d'aplat et de bordure. */
  danger: string;
  /** Variante contrastée de `danger`, pour le texte et les icônes. */
  dangerDeep: string;
  dangerSoft: string;
  /** Texte et icônes posés sur `danger`. */
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

/**
 * Échelle d'espacement du design system : 8 · 12 · 16 · 20 · 24 · 32, sur une
 * base de 4 pt. `xxs` complète l'échelle par le bas pour les gouttières les
 * plus fines, que le design utilise sans les nommer.
 *
 * Ces valeurs sont déjà exprimées en points d'appareil — contrairement aux
 * mesures de composants relevées sur la maquette, elles ne passent **pas** par
 * le facteur d'échelle de `scale.ts`.
 */
export interface ThemeSpacing {
  none: 0;
  xxs: number;
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

/** Graisses employées par le design : 400 · 500 · 600 · 700. */
export type FontWeightToken = '400' | '500' | '600' | '700';

export interface ThemeFonts {
  /**
   * Familles typographiques, une par graisse.
   *
   * React Native ne sait pas dériver une graisse d'une famille : sur Android,
   * déclarer `fontFamily: 'Lexend'` avec `fontWeight: '600'` rend du 400. Chaque
   * graisse est donc une famille distincte, chargée depuis son propre fichier.
   *
   * `--font-display` est **Lexend**, `--font-body` **Atkinson Hyperlegible**,
   * cette dernière étant dessinée pour la lisibilité et la dyslexie.
   */
  display: Readonly<Record<FontWeightToken, string>>;
  body: Readonly<Record<FontWeightToken, string>>;
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
