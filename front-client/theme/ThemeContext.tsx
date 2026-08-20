import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';

import { defaultTheme, getTheme } from './themes';
import type { ColorScheme, Theme, ThemeMode } from './types';

const STORAGE_KEY = '@backrelief/theme-mode';

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export interface ThemeContextValue {
  theme: Theme;
  /** Préférence exprimée : `'system'` suit le réglage de l'OS. */
  mode: ThemeMode;
  /** Schéma effectivement appliqué, une fois `'system'` résolu. */
  scheme: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  /** `true` tant que la préférence persistée n'a pas été relue. */
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
  mode: defaultTheme.scheme,
  scheme: defaultTheme.scheme,
  setMode: () => undefined,
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
   * terminée — le thème sombre, lui, est déjà complet.
   */
  initialMode?: ThemeMode;
  /** Désactive la persistance. Utile en test et en preview. */
  persist?: boolean;
}

export function ThemeProvider({
  children,
  initialMode = 'light',
  persist = true,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const [isHydrating, setIsHydrating] = useState(persist);

  useEffect(() => {
    if (!persist) {
      return;
    }
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!cancelled && isThemeMode(stored)) {
          setModeState(stored);
        }
      })
      .catch(() => {
        // Une préférence illisible n'est pas une erreur bloquante : on reste
        // sur `initialMode`.
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
        AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
      }
    },
    [persist],
  );

  const scheme: ColorScheme = mode === 'system' ? (systemScheme ?? 'light') : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: getTheme(scheme), mode, scheme, setMode, isHydrating }),
    [scheme, mode, setMode, isHydrating],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Accès au thème courant. Fonctionne sans provider (repli sur le thème clair). */
export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

/** Accès au contrôleur de thème : lecture du mode et bascule. */
export function useThemeController(): ThemeContextValue {
  return useContext(ThemeContext);
}
