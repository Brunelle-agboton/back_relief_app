import { Platform } from 'react-native';

import type { ColorScheme, ThemeShadows } from '../types';

import { px } from './scale';

/**
 * Ombres portées, transcrites de `--shadow-card`, `--shadow-pop` et de l'ombre
 * du bouton primaire.
 *
 * Deux écarts inévitables avec le CSS :
 *
 * 1. React Native n'accepte qu'une seule couche d'ombre là où
 *    `--shadow-card` en empile deux — on conserve la couche dominante
 *    (`0 6px 18px`), la couche de contact étant quasi imperceptible.
 * 2. Le rayon de flou CSS vaut environ le double du `shadowRadius` iOS : les
 *    valeurs sont donc divisées par deux après mise à l'échelle.
 *
 * `shadow*` ne rend que sur iOS et `elevation` que sur Android : les deux sont
 * renseignés. En sombre, une ombre noire est invisible ; la profondeur est
 * alors portée par la hiérarchie des surfaces (`surface` → `surfaceRaised`) et
 * l'`elevation` ne sert plus qu'à l'ordre d'empilement.
 */
export function createShadows(scheme: ColorScheme): ThemeShadows {
  const isDark = scheme === 'dark';
  // rgba(30, 25, 20, …) dans le design : un noir très légèrement chaud.
  const shadowColor = isDark ? '#000000' : '#1e1914';

  const make = (elevation: number, cssBlur: number, cssY: number, opacity: number) =>
    Object.freeze({
      ...Platform.select({
        ios: {
          shadowColor,
          shadowOffset: { width: 0, height: px(cssY) },
          shadowRadius: px(cssBlur) / 2,
          shadowOpacity: isDark ? Math.min(opacity * 2, 0.5) : opacity,
        },
        default: {},
      }),
      elevation,
    });

  return Object.freeze({
    none: Object.freeze({ elevation: 0 }),
    /** `--shadow-card` — couche dominante `0 6px 18px rgba(30,25,20,.05)`. */
    card: make(2, 18, 6, 0.05),
    /** `.pa-btn-primary` — `0 2px 10px rgba(0,0,0,.08)`. */
    raised: make(3, 10, 2, 0.08),
    /** `--shadow-pop` — `0 12px 40px rgba(30,25,20,.18)`. */
    pop: make(12, 40, 12, 0.18),
  });
}
