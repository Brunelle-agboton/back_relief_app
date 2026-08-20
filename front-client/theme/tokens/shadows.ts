import { Platform } from 'react-native';

import type { ColorScheme, ThemeShadows } from '../types';

/**
 * Ombres portées.
 *
 * React Native n'unifie pas iOS et Android : `shadow*` n'a d'effet que sur iOS,
 * `elevation` que sur Android. Les deux sont donc renseignés.
 *
 * En sombre, une ombre noire est invisible : la profondeur est portée par la
 * hiérarchie des surfaces (`surface` → `surfaceRaised`), et l'`elevation`
 * Android est conservée uniquement pour l'ordre d'empilement.
 */
export function createShadows(scheme: ColorScheme): ThemeShadows {
  const isDark = scheme === 'dark';
  const shadowColor = isDark ? '#000000' : '#16211A';

  const make = (elevation: number, radius: number, y: number, opacity: number) =>
    Object.freeze({
      ...Platform.select({
        ios: {
          shadowColor,
          shadowOffset: { width: 0, height: y },
          shadowRadius: radius,
          shadowOpacity: isDark ? opacity * 1.6 : opacity,
        },
        default: {},
      }),
      elevation,
    });

  return Object.freeze({
    none: Object.freeze({ elevation: 0 }),
    sm: make(1, 3, 1, 0.05),
    md: make(3, 8, 3, 0.08),
    lg: make(8, 18, 8, 0.12),
  });
}
