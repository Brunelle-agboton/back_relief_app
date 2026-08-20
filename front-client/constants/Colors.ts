/**
 * Compatibilité ascendante.
 *
 * Ce fichier était le jeu de couleurs par défaut d'Expo, jamais aligné sur
 * l'identité du produit. Il est désormais **dérivé du système de thèmes**
 * (`theme/`) afin que `useThemeColor`, `ThemedText` et `ThemedView`
 * continuent de fonctionner sans modification tout en affichant les bonnes
 * couleurs.
 *
 * Pour tout nouveau code, ne pas importer d'ici : utiliser `useTheme()` /
 * `makeStyles()` depuis `@/theme`, qui exposent l'ensemble des rôles.
 */
import { darkTheme, lightTheme } from '@/theme';
import type { Theme } from '@/theme';

const toLegacyPalette = (theme: Theme) => ({
  text: theme.colors.ink,
  background: theme.colors.bg,
  tint: theme.colors.accent,
  icon: theme.colors.ink2,
  tabIconDefault: theme.colors.tabBar.inactive,
  tabIconSelected: theme.colors.tabBar.active,
});

export const Colors = {
  light: toLegacyPalette(lightTheme),
  dark: toLegacyPalette(darkTheme),
};
