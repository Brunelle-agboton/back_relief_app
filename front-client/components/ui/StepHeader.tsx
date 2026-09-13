import React from 'react';
import { Pressable, View } from 'react-native';

import { makeStyles, px, useTheme } from '@/theme';

import { Text } from './Text';

const SIZE = px(30);

const useStyles = makeStyles((theme) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // `OnbTop` : bouton de retour circulaire de 30 px sur fond `--bg`.
  back: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: SIZE,
  },
  pressed: {
    opacity: 0.6,
  },
}));

export interface StepHeaderProps {
  step: number;
  count: number;
  /** Sans gestionnaire, la place du bouton est conservée mais laissée vide. */
  onBack?: () => void;
  backAccessibilityLabel?: string;
}

/**
 * Bandeau d'étape : retour à gauche, position dans le parcours au centre.
 * Transcrit de `OnbTop`.
 */
export function StepHeader({
  step,
  count,
  onBack,
  backAccessibilityLabel = 'Précédent',
}: StepHeaderProps) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <View style={styles.root}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backAccessibilityLabel}
          onPress={onBack}
          // Le disque fait 37.5 pt ; la zone tactile atteint les 44 pt exigés.
          hitSlop={4}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Text variant="h3" color="ink" style={{ lineHeight: theme.typography.h3.fontSize }}>
            ‹
          </Text>
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}

      <Text variant="meta">
        Étape {step + 1} / {count}
      </Text>

      <View style={styles.spacer} />
    </View>
  );
}
