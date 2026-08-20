import React from 'react';
import { Pressable, View } from 'react-native';

import { makeStyles, px } from '@/theme';

import { Text } from './Text';

const useStyles = makeStyles((theme) => ({
  // `.pa-seg` : pilule, 3 px de padding, fond `--bg`, contour `--line`.
  root: {
    flexDirection: 'row',
    gap: px(3),
    padding: px(3),
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  // `.pa-seg > button` : 7 px / 6 px de padding.
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: px(7),
    paddingHorizontal: px(6),
    borderRadius: theme.radius.pill,
  },
  // `.pa-seg > button.on` : surface, texte `--ink`, ombre légère.
  optionSelected: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.raised,
  },
  pressed: {
    opacity: 0.75,
  },
}));

export interface SegmentedOption<T> {
  label: string;
  value: T;
  testID?: string;
}

export interface SegmentedProps<T> {
  options: readonly SegmentedOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Décrit le groupe pour les technologies d'assistance. */
  accessibilityLabel?: string;
}

/**
 * Contrôle segmenté, transcrit de `.pa-seg`.
 *
 * Générique sur la valeur : les options portent la valeur métier plutôt qu'un
 * index, ce qui évite aux écrans de traduire dans les deux sens.
 */
export function Segmented<T extends string | number | boolean>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedProps<T>) {
  const styles = useStyles();

  return (
    <View style={styles.root} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={String(option.value)}
            testID={option.testID}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.optionSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text variant="label" color={selected ? 'ink' : 'ink2'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
