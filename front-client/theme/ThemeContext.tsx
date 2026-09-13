import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';

import { defaultAmbiance } from './tokens/ambiances';
import { ambianceNames, defaultTheme, getTheme } from './themes';
import type { AmbianceName, ColorScheme, Theme, ThemeMode } from './types';

const MODE_KEY = '@backrelief/theme-mode';
const AMBIANCE_KEY = '@backrelief/theme-ambiance';

interface ThemeStorage {
  multiGet: (keys: string[]) => Promise<readonly (readonly [string, string | null])[]>;
  setItem: (key: string, value: string) => Promise<void>;
}

let cachedStorage: ThemeStorage | null | undefined;

/**
 * Charge AsyncStorage à la demande plutôt qu'au chargement du module.
 *
 * Le module natif lève dès son import quand il n'est pas lié — c'est le cas
 * sous Jest. Or les écrans importent les primitives d'interface, qui importent
 * le thème : un import direct rendrait le thème intestable sans que chaque
 * suite ait à le simuler. La persistance est donc chargée au premier usage, et
 * son absence dégrade proprement — le thème fonctionne, il ne se souvient
 * simplement pas du choix d'une session à l'autre.
 */
function getStorage(): ThemeStorage | null {
  if (cachedStorage === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('@react-native-async-storage/async-storage');
      cachedStorage = (mod?.default ?? mod) as ThemeStorage;
    } catch {
      cachedStorage = null;
    }
  }
  return cachedStorage;
}

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
    const storage = persist ? getStorage() : null;
    if (!storage) {
      setIsHydrating(false);
      return;
    }
    let cancelled = false;

    storage
      .multiGet([MODE_KEY, AMBIANCE_KEY])
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
        getStorage()?.setItem(MODE_KEY, next).catch(() => undefined);
      }
    },
    [persist],
  );

  const setAmbiance = useCallback(
    (next: AmbianceName) => {
      setAmbianceState(next);
      if (persist) {
        getStorage()?.setItem(AMBIANCE_KEY, next).catch(() => undefined);
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
