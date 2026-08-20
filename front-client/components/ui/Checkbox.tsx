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
  box: {
    width: SIZE,
    height: SIZE,
    borderRadius: theme.radius.xs,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  label: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
}));

export interface CheckboxProps {
  label?: string;
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * Case à cocher.
 *
 * Le glyphe de validation reprend celui que le design utilise pour les étapes
 * terminées d'un programme (`ExStep`).
 */
export function Checkbox({ label, checked, onPress, disabled = false, testID }: CheckboxProps) {
  const styles = useStyles();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? (
          <Text variant="caption" color="onAccent">
            ✓
          </Text>
        ) : null}
      </View>
      {label ? (
        <Text variant="body" style={styles.label}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
