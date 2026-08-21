import { ambianceNames, defaultAmbiance, getTheme } from '@/theme';
import type { ColorScheme, Theme } from '@/theme';

/**
 * Vérification des contrastes WCAG directement sur les thèmes.
 *
 * Le design system revendique « contraste WCAG AA minimal » sans le vérifier :
 * sa propre variante de bouton « succès » — libellé `#39DF87` sur aplat
 * `#d4f5e9` — plafonne à 1.49:1. Ces tests figent les garanties que le thème
 * apporte réellement, pour qu'une mise à jour de palette ne les perde pas en
 * silence.
 */

const AA_TEXT = 4.5;
/** Seuil des éléments non textuels : icônes, contours de contrôle. */
const AA_NON_TEXT = 3;

function channels(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

const allThemes: Theme[] = ambianceNames.flatMap((ambiance) =>
  (['light', 'dark'] as ColorScheme[]).map((scheme) => getTheme(ambiance, scheme)),
);

/**
 * Thèmes dont le design fournit des couleurs de marque sous le seuil AA.
 *
 * Ces deux ambiances ne sont pas utilisées par l'app — `defaultAmbiance` vaut
 * `brume`. Leurs écarts sont figés par un test de caractérisation dédié plutôt
 * que corrigés d'autorité : ce sont des valeurs livrées par le design.
 */
const BRAND_BELOW_AA = new Set(['sauge-light', 'terracotta-light']);
const brandCompliantThemes = allThemes.filter((theme) => !BRAND_BELOW_AA.has(theme.name));

describe('contrastes du thème', () => {
  it('vérifie correctement des paires connues', () => {
    // Garde-fou sur l'outil de mesure lui-même.
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    expect(contrastRatio('#39df87', '#d4f5e9')).toBeLessThan(1.6);
  });

  describe.each(allThemes.map((theme) => [theme.name, theme] as const))('%s', (_name, theme) => {
    const { colors } = theme;

    it('rend le texte principal et secondaire lisible', () => {
      expect(contrastRatio(colors.ink, colors.surface)).toBeGreaterThanOrEqual(AA_TEXT);
      expect(contrastRatio(colors.ink, colors.bg)).toBeGreaterThanOrEqual(AA_TEXT);
      expect(contrastRatio(colors.ink2, colors.surface)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it('rend le texte de marque lisible sur la surface', () => {
      expect(contrastRatio(colors.accentDeep, colors.surface)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it('rend lisible le libellé posé sur l’aplat de réussite', () => {
      // C'est l'inversion décidée pour le bouton « succès » : le vert devient
      // l'aplat, `onGood` le libellé.
      expect(contrastRatio(colors.onGood, colors.good)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it('rend lisible le texte de réussite sur les fonds clairs', () => {
      expect(contrastRatio(colors.goodDeep, colors.surface)).toBeGreaterThanOrEqual(AA_TEXT);
      expect(contrastRatio(colors.goodDeep, colors.goodSoft)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it('rend lisible le message d’erreur sur son aplat', () => {
      expect(contrastRatio(colors.dangerDeep, colors.surface)).toBeGreaterThanOrEqual(AA_TEXT);
      expect(contrastRatio(colors.dangerDeep, colors.dangerSoft)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it('rend les bordures de contrôle perceptibles', () => {
      expect(contrastRatio(colors.accent, colors.surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    });
  });

  describe.each(brandCompliantThemes.map((theme) => [theme.name, theme] as const))(
    '%s — couleurs de marque',
    (_name, theme) => {
      it('rend le texte de marque lisible sur le fond d’écran et l’aplat clair', () => {
        const { colors } = theme;
        expect(contrastRatio(colors.accentDeep, colors.bg)).toBeGreaterThanOrEqual(AA_TEXT);
        expect(contrastRatio(colors.accentDeep, colors.accentSoft)).toBeGreaterThanOrEqual(AA_TEXT);
      });
    },
  );

  describe('boutons de marque', () => {
    it('sont conformes dans l’ambiance active', () => {
      const brume = getTheme(defaultAmbiance, 'light');
      // Bouton primaire : libellé sur l'aplat de marque.
      expect(contrastRatio(brume.colors.onAccent, brume.colors.accent)).toBeGreaterThanOrEqual(
        AA_TEXT,
      );
      // Bouton secondaire : libellé de marque sur l'aplat clair.
      expect(contrastRatio(brume.colors.accent, brume.colors.accentSoft)).toBeGreaterThanOrEqual(
        AA_TEXT,
      );
      expect(
        contrastRatio(brume.colors.accentDeep, brume.colors.accentSoft),
      ).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it('restent non conformes en sauge et terracotta, valeurs du design', () => {
      // Test de caractérisation, et non de validation : ces deux ambiances ne
      // sont pas utilisées par l'app. Les rapports mesurés sont figés ici pour
      // que toute correction du design se signale d'elle-même, et impose de
      // remonter les paires concernées dans les blocs conformes ci-dessus.
      const sauge = getTheme('sauge', 'light').colors;
      const terracotta = getTheme('terracotta', 'light').colors;

      // Libellé blanc sur l'aplat de marque — bouton primaire.
      expect(contrastRatio(sauge.onAccent, sauge.accent)).toBeCloseTo(3.13, 1);
      expect(contrastRatio(terracotta.onAccent, terracotta.accent)).toBeCloseTo(3.36, 1);

      // Texte de marque sur l'aplat clair — bouton secondaire, puce de catégorie.
      expect(contrastRatio(sauge.accentDeep, sauge.accentSoft)).toBeCloseTo(3.91, 1);
      expect(contrastRatio(terracotta.accentDeep, terracotta.accentSoft)).toBeCloseTo(3.8, 1);

      // Texte de marque sur le fond d'écran — sur-titres.
      expect(contrastRatio(sauge.accentDeep, sauge.bg)).toBeCloseTo(4.07, 1);
      expect(contrastRatio(terracotta.accentDeep, terracotta.bg)).toBeCloseTo(4.17, 1);
    });
  });
});
