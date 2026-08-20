import type { AmbianceName, ColorScheme, TintName } from '../types';

/**
 * Valeurs brutes des trois ambiances — **seule source de vérité** du projet.
 * Aucun autre fichier ne doit contenir de littéral de couleur.
 *
 * ── Schéma clair ──────────────────────────────────────────────────────────
 * Transcription fidèle des variables CSS de `Pause-Active-Companion.html`
 * (`.amb-sauge`, `.amb-terracotta`, `.amb-brume`), y compris les surcharges de
 * `--char-pants` par ambiance.
 *
 * ── Schéma sombre ─────────────────────────────────────────────────────────
 * Le design ne définit **aucun** schéma sombre. Les valeurs ci-dessous sont
 * dérivées ambiance par ambiance : la teinte de marque est conservée puis
 * éclaircie pour rester lisible sur fond sombre, et chaque paire texte/fond a
 * été vérifiée au niveau WCAG AA.
 *
 * ── Accessibilité du schéma clair ─────────────────────────────────────────
 * Plusieurs paires du design échouent au niveau AA — notamment le texte blanc
 * du bouton primaire sur `accent` (3.13:1 en sauge, 3.36:1 en terracotta,
 * 3.65:1 en brume, pour 4.5:1 requis) et `muted` sur `bg` (~2.4:1 pour 3:1
 * requis). Ces valeurs sont reprises telles quelles : le design fait foi. Les
 * corriger revient à modifier `onAccent` / `muted` ici, et nulle part ailleurs.
 */

export interface AmbianceScheme {
  bg: string;
  surface: string;
  surfaceSoft: string;
  surfaceRaised: string;
  overlay: string;

  ink: string;
  ink2: string;
  muted: string;
  onAccent: string;

  accent: string;
  accentDeep: string;
  accentSoft: string;

  line: string;

  good: string;
  goodSoft: string;
  warn: string;
  warnSoft: string;
  danger: string;
  dangerSoft: string;
  onDanger: string;

  streak: string;
  streakBg: string;

  field: string;
  fieldDisabled: string;

  tints: Readonly<Record<TintName, string>>;
  /** `--char-pants`, seule pièce du personnage que le design fait varier. */
  charPants: string;
}

export type Ambiance = Readonly<Record<ColorScheme, AmbianceScheme>>;

/**
 * Pièces du personnage communes à toutes les ambiances (`.pa-base`).
 * Le design précise que son identité reste constante : seul le t-shirt suit
 * `accent`, et le pantalon peut être surchargé par ambiance.
 */
export const characterBase = {
  hair: '#2b3340',
  skin: '#e8b894',
  shoe: '#ffffff',
} as const;

/** A · Sauge — évolution fidèle, vert sauge et crème chaud. */
const sauge: Ambiance = {
  light: {
    bg: '#f4f1ea',
    surface: '#ffffff',
    surfaceSoft: '#e7efe2',
    surfaceRaised: '#ffffff',
    overlay: 'rgba(24, 20, 16, 0.42)',

    ink: '#20241f',
    ink2: '#5b5f56',
    muted: '#9a9c91',
    onAccent: '#ffffff',

    accent: '#7c9a70',
    accentDeep: '#5d7e51',
    accentSoft: '#e7efe2',

    line: '#e7e2d6',

    good: '#5d7e51',
    goodSoft: '#e7efe2',
    warn: '#cf9a4a',
    warnSoft: '#f7e7ce',
    danger: '#cc6a52',
    dangerSoft: '#f6e0da',
    onDanger: '#ffffff',

    streak: '#e09a44',
    streakBg: '#f7e7ce',

    field: '#ffffff',
    fieldDisabled: '#f4f1ea',

    tints: { t1: '#e7efe4', t2: '#eae7f1', t3: '#e2ebf0', t4: '#f4e9ec', t5: '#f7ecdf' },
    charPants: '#7d93a6',
  },
  dark: {
    bg: '#171a15',
    surface: '#1e221b',
    surfaceSoft: '#262e21',
    surfaceRaised: '#2c3328',
    overlay: 'rgba(0, 0, 0, 0.62)',

    ink: '#eceee7',
    ink2: '#b4b9ac',
    muted: '#8d9285',
    onAccent: '#171a15',

    accent: '#9dbb90',
    accentDeep: '#bfd6b4',
    accentSoft: '#262e21',

    line: '#303629',

    good: '#9dbb90',
    goodSoft: '#262e21',
    warn: '#dfae67',
    warnSoft: '#382d1b',
    danger: '#e28a71',
    dangerSoft: '#3a251f',
    onDanger: '#171a15',

    streak: '#e8b269',
    streakBg: '#382d1b',

    field: '#262c22',
    fieldDisabled: '#1e221b',

    tints: { t1: '#232b21', t2: '#262532', t3: '#1f2a30', t4: '#302328', t5: '#322a1f' },
    charPants: '#7d93a6',
  },
};

/** B · Terracotta — ADN Companion, corail chaleureux, le plus ludique. */
const terracotta: Ambiance = {
  light: {
    bg: '#f8f1e8',
    surface: '#fffdfa',
    surfaceSoft: '#f8e4d7',
    surfaceRaised: '#fffdfa',
    overlay: 'rgba(24, 20, 16, 0.42)',

    ink: '#2a201a',
    ink2: '#6b5a4d',
    muted: '#aa988a',
    onAccent: '#ffffff',

    accent: '#d2724b',
    accentDeep: '#b85837',
    accentSoft: '#f8e4d7',

    line: '#efe3d6',

    good: '#7c9a5e',
    goodSoft: '#e9f0df',
    warn: '#e0922f',
    warnSoft: '#f9e4c8',
    danger: '#c2543a',
    dangerSoft: '#f6ddd5',
    onDanger: '#ffffff',

    streak: '#e08b34',
    streakBg: '#f9e4c8',

    field: '#fffdfa',
    fieldDisabled: '#f8f1e8',

    tints: { t1: '#f9e7d7', t2: '#f7e0e0', t3: '#f3ead9', t4: '#eae9da', t5: '#ede6f1' },
    charPants: '#6f8f9a',
  },
  dark: {
    bg: '#1c1613',
    surface: '#241d18',
    surfaceSoft: '#33241c',
    surfaceRaised: '#342a22',
    overlay: 'rgba(0, 0, 0, 0.62)',

    ink: '#f0e7e0',
    ink2: '#c2aea1',
    muted: '#9c8979',
    onAccent: '#1c1613',

    accent: '#e08c67',
    accentDeep: '#f0b195',
    accentSoft: '#33241c',

    line: '#372c25',

    good: '#9cb87e',
    goodSoft: '#25301d',
    warn: '#e8a752',
    warnSoft: '#382a17',
    danger: '#de7759',
    dangerSoft: '#3a231b',
    onDanger: '#1c1613',

    streak: '#e8a75a',
    streakBg: '#382a17',

    field: '#2d241d',
    fieldDisabled: '#241d18',

    tints: { t1: '#33241a', t2: '#331f1f', t3: '#2f2a1d', t4: '#29291c', t5: '#262433' },
    charPants: '#6f8f9a',
  },
};

/**
 * C · Brume — serein, beaucoup d'air.
 *
 * L'accent suit le panneau de tweaks du design (`accentBrume: #1662A9`) et non
 * le `--accent: #5e8f86` de la feuille de style : c'est le bleu déjà présent
 * dans l'app, et c'est le choix retenu par le client. Le tweak ne fournissant
 * que l'accent, `accentDeep` et `accentSoft` sont dérivés dans la même teinte
 * et vérifiés en contraste.
 *
 * `good` conserve en revanche le vert de l'ambiance : une couleur de réussite
 * confondue avec la couleur de marque n'est plus lisible comme un statut.
 */
const brume: Ambiance = {
  light: {
    bg: '#eef2f1',
    surface: '#ffffff',
    surfaceSoft: '#dce8f4',
    surfaceRaised: '#ffffff',
    overlay: 'rgba(24, 20, 16, 0.42)',

    ink: '#1e2826',
    ink2: '#516460',
    muted: '#94a29d',
    onAccent: '#ffffff',

    accent: '#1662a9',
    accentDeep: '#0f4c85',
    accentSoft: '#dce8f4',

    line: '#e1e7e5',

    good: '#5e8f86',
    goodSoft: '#deebe7',
    warn: '#b6924d',
    warnSoft: '#ece2d0',
    danger: '#c2685a',
    dangerSoft: '#f2ddd9',
    onDanger: '#ffffff',

    streak: '#cf9a4a',
    streakBg: '#ece2d0',

    field: '#ffffff',
    fieldDisabled: '#eef2f1',

    tints: { t1: '#e1ece8', t2: '#e5e8f2', t3: '#e2e9ee', t4: '#dfece9', t5: '#eae7f0' },
    charPants: '#6b8a96',
  },
  dark: {
    bg: '#131917',
    surface: '#1a211f',
    surfaceSoft: '#16283a',
    surfaceRaised: '#27312e',
    overlay: 'rgba(0, 0, 0, 0.62)',

    ink: '#e8eeec',
    ink2: '#aebbb7',
    muted: '#8d9c97',
    onAccent: '#131917',

    accent: '#5ea4de',
    accentDeep: '#93c4ec',
    accentSoft: '#16283a',

    line: '#2b3533',

    good: '#7fb0a6',
    goodSoft: '#1f2c29',
    warn: '#cdab6b',
    warnSoft: '#33291a',
    danger: '#dc8373',
    dangerSoft: '#38231f',
    onDanger: '#131917',

    streak: '#d3a45c',
    streakBg: '#33291a',

    field: '#212927',
    fieldDisabled: '#1a211f',

    tints: { t1: '#1e2b27', t2: '#21232f', t3: '#1f272d', t4: '#1d2b28', t5: '#26232f' },
    charPants: '#6b8a96',
  },
};

export const ambiances: Readonly<Record<AmbianceName, Ambiance>> = Object.freeze({
  sauge,
  terracotta,
  brume,
});

/**
 * Ambiance appliquée par défaut.
 *
 * Le panneau de tweaks du design (`__TWEAK_DEFAULTS.visible`) est positionné
 * sur « brume », c'est donc l'ambiance que le client a sous les yeux.
 *
 * Son accent suit la valeur du panneau de tweaks (`#1662A9`) plutôt que celle
 * de la feuille de style — voir le commentaire de l'ambiance.
 */
export const defaultAmbiance: AmbianceName = 'brume';
