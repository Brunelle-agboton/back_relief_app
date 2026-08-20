import React from 'react';
import { Pressable, View } from 'react-native';

import { makeStyles, px } from '@/theme';

import { Text } from './Text';

const SIZE = px(20);

const useStyles = makeStyles((theme) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: {
    borderColor: theme.colors.accent,
  },
  // `.pa-dot.on` : pastille pleine à l'accent.
  dot: {
    width: SIZE / 2,
    height: SIZE / 2,
    borderRadius: SIZE / 4,
    backgroundColor: theme.colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
}));

export interface RadioProps {
  label?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * Bouton radio.
 *
 * Le design ne spécifie pas de contrôle de formulaire : la pastille reprend
 * `.pa-dot.on`. La zone tactile couvre le libellé, et non le seul cercle.
 */
export function Radio({ label, selected, onPress, disabled = false, testID }: RadioProps) {
  const styles = useStyles();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={[styles.circle, selected && styles.circleSelected]}>
        {selected ? <View style={styles.dot} /> : null}
      </View>
      {label ? <Text variant="body">{label}</Text> : null}
    </Pressable>
  );
}
