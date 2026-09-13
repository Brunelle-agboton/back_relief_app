import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import { useTheme } from './ThemeContext';
import type { Theme } from './types';

type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

/**
 * Construit un hook de styles dépendant du thème.
 *
 *     const useStyles = makeStyles((t) => ({
 *       card: { backgroundColor: t.colors.surface, padding: t.spacing.lg },
 *     }));
 *
 *     function Card() {
 *       const s = useStyles();
 *       return <View style={s.card} />;
 *     }
 *
 * La feuille est mémoïsée par identité de thème et partagée entre toutes les
 * instances du composant : les thèmes sont des objets figés au niveau module,
 * donc `StyleSheet.create` n'est appelé qu'une fois par thème et par factory,
 * et non à chaque rendu.
 */
export function makeStyles<T extends NamedStyles>(factory: (theme: Theme) => T) {
  const cache = new WeakMap<Theme, T>();

  return function useStyles(): T {
    const theme = useTheme();

    return useMemo(() => {
      const cached = cache.get(theme);
      if (cached) {
        return cached;
      }
      const created = StyleSheet.create(factory(theme));
      cache.set(theme, created);
      return created;
    }, [theme]);
  };
}
