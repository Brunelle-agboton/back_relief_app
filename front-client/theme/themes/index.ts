import { defaultAmbiance } from '../tokens/ambiances';
import type { AmbianceName, ColorScheme, Theme } from '../types';

import { createTheme } from './createTheme';

export { createTheme } from './createTheme';

export const ambianceNames: readonly AmbianceName[] = ['sauge', 'terracotta', 'brume'];
const schemes: readonly ColorScheme[] = ['light', 'dark'];

/**
 * Les six thèmes du produit — 3 ambiances × 2 schémas — construits une fois au
 * chargement du module. Leur identité étant stable, `makeStyles` peut mémoïser
 * ses feuilles de styles dessus.
 */
export const themes = Object.freeze(
  Object.fromEntries(
    ambianceNames.map((ambiance) => [
      ambiance,
      Object.freeze(
        Object.fromEntries(schemes.map((scheme) => [scheme, createTheme(ambiance, scheme)])),
      ),
    ]),
  ) as Record<AmbianceName, Record<ColorScheme, Theme>>,
);

export function getTheme(ambiance: AmbianceName, scheme: ColorScheme): Theme {
  return themes[ambiance][scheme];
}

/** Thème appliqué tant qu'aucun `ThemeProvider` n'est monté (tests unitaires). */
export const defaultTheme: Theme = themes[defaultAmbiance].light;
