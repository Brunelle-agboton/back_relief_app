import React from 'react';
import { View } from 'react-native';

import { makeStyles, px } from '@/theme';

const useStyles = makeStyles((theme) => ({
  root: {
    flexDirection: 'row',
    gap: px(6),
  },
  // `OnbProgress` : barres de 4 px, rayon pilule.
  bar: {
    flex: 1,
    height: px(4),
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.line,
  },
  barDone: {
    backgroundColor: theme.colors.accent,
  },
}));

export interface StepProgressProps {
  /** Index de l'étape courante, à partir de 0. */
  step: number;
  /** Nombre total d'étapes du parcours. */
  count: number;
}

/** Jauge d'avancement d'un parcours, transcrite de `OnbProgress`. */
export function StepProgress({ step, count }: StepProgressProps) {
  const styles = useStyles();

  return (
    <View
      style={styles.root}
      // Regroupe les barres en un seul élément d'accessibilité : un lecteur
      // d'écran annonce l'avancement, pas trois rectangles décoratifs.
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: count, now: step + 1 }}
    >
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={[styles.bar, index <= step && styles.barDone]} />
      ))}
    </View>
  );
}
