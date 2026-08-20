import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';

import { defaultAmbiance } from './tokens/ambiances';
import { ambianceNames, defaultTheme, getTheme } from './themes';
import type { AmbianceName, ColorScheme, Theme, ThemeMode } from './types';

const MODE_KEY = '@backrelief/theme-mode';
const AMBIANCE_KEY = '@backrelief/theme-ambiance';

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isAmbiance(value: unknown): value is AmbianceName {
  return typeof value === 'string' && (ambianceNames as readonly string[]).includes(value);
}

export interface ThemeContextValue {
  theme: Theme;
  /** Ambiance active parmi les trois du design. */
  ambiance: AmbianceName;
  /** Préférence exprimée : `'system'` suit le réglage de l'OS. */
  mode: ThemeMode;
  /** Schéma effectivement appliqué, une fois `'system'` résolu. */
  scheme: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  setAmbiance: (ambiance: AmbianceName) => void;
  /** `true` tant que les préférences persistées n'ont pas été relues. */
  isHydrating: boolean;
}

/**
 * Valeur par défaut délibérément fonctionnelle : `useTheme()` doit renvoyer un
 * thème valide même sans `ThemeProvider` au-dessus. Les tests unitaires rendent
 * les écrans isolément (`render(<LoginScreen />)`) — sans ce repli, toute la
 * suite Jest tomberait à la première migration d'écran.
 */
const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  ambiance: defaultTheme.ambiance,
  mode: defaultTheme.scheme,
  scheme: defaultTheme.scheme,
  setMode: () => undefined,
  setAmbiance: () => undefined,
  isHydrating: false,
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * Mode appliqué avant relecture de la préférence persistée.
   *
   * Volontairement `'light'` et non `'system'` : les écrans encore non migrés
   * codent leurs couleurs en dur (texte sombre sur fond supposé blanc). Passer
   * cette valeur à `'system'` suffira à ouvrir le sombre une fois la migration
   * terminée — les trois ambiances sombres, elles, sont déjà complètes.
   */
  initialMode?: ThemeMode;
  /** Ambiance appliquée avant relecture de la préférence persistée. */
  initialAmbiance?: AmbianceName;
  /** Désactive la persistance. Utile en test et en preview. */
  persist?: boolean;
}

export function ThemeProvider({
  children,
  initialMode = 'light',
  initialAmbiance = defaultAmbiance,
  persist = true,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const [ambiance, setAmbianceState] = useState<AmbianceName>(initialAmbiance);
  const [isHydrating, setIsHydrating] = useState(persist);

  useEffect(() => {
    if (!persist) {
      return;
    }
    let cancelled = false;

    AsyncStorage.multiGet([MODE_KEY, AMBIANCE_KEY])
      .then((entries) => {
        if (cancelled) {
          return;
        }
        for (const [key, value] of entries) {
          if (key === MODE_KEY && isThemeMode(value)) {
            setModeState(value);
          }
          if (key === AMBIANCE_KEY && isAmbiance(value)) {
            setAmbianceState(value);
          }
        }
      })
      .catch(() => {
        // Une préférence illisible n'est pas une erreur bloquante : on reste
        // sur les valeurs initiales.
      })
      .finally(() => {
        if (!cancelled) {
          setIsHydrating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [persist]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      if (persist) {
        AsyncStorage.setItem(MODE_KEY, next).catch(() => undefined);
      }
    },
    [persist],
  );

  const setAmbiance = useCallback(
    (next: AmbianceName) => {
      setAmbianceState(next);
      if (persist) {
        AsyncStorage.setItem(AMBIANCE_KEY, next).catch(() => undefined);
      }
    },
    [persist],
  );

  const scheme: ColorScheme = mode === 'system' ? (systemScheme ?? 'light') : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: getTheme(ambiance, scheme),
      ambiance,
      mode,
      scheme,
      setMode,
      setAmbiance,
      isHydrating,
    }),
    [ambiance, scheme, mode, setMode, setAmbiance, isHydrating],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Accès au thème courant. Fonctionne sans provider (repli sur l'ambiance par défaut, en clair). */
export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

/** Accès au contrôleur : lecture du mode et de l'ambiance, et bascule. */
export function useThemeController(): ThemeContextValue {
  return useContext(ThemeContext);
}
