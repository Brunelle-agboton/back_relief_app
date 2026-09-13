import React from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import { makeStyles, px } from '@/theme';

import { Text } from './Text';

/** `.pa-chip` et ses variantes `-on`, `-cat`, `-soft`. */
export type ChipVariant = 'default' | 'on' | 'cat' | 'soft';

const useStyles = makeStyles((theme) => ({
  // `.pa-chip` : pilule, 5 px / 11 px de padding dans le design.
  base: {
    borderRadius: theme.radius.pill,
    paddingVertical: px(5),
    paddingHorizontal: px(11),
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xxs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  default: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
  },
  on: {
    backgroundColor: theme.colors.accent,
  },
  cat: {
    backgroundColor: theme.colors.accentSoft,
  },
  soft: {
    backgroundColor: theme.colors.bg,
  },
  pressed: {
    opacity: 0.85,
  },
}));

const LABEL_COLOR = {
  default: 'ink2',
  on: 'onAccent',
  cat: 'accentDeep',
  soft: 'ink2',
} as const;

export interface ChipProps extends ViewProps {
  label: string;
  variant?: ChipVariant;
  /** Rend la puce actionnable. Sans ce gestionnaire, elle reste décorative. */
  onPress?: () => void;
  /** Marque la puce comme sélectionnée pour les technologies d'assistance. */
  selected?: boolean;
}

export function Chip({ label, variant = 'default', onPress, selected, style, ...rest }: ChipProps) {
  const styles = useStyles();
  const content = (
    <Text variant="label" color={LABEL_COLOR[variant]}>
      {label}
    </Text>
  );

  if (!onPress) {
    return (
      <View style={[styles.base, styles[variant], style]} {...rest}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      // Une puce mesure 33 pt de haut : l'agrandir déformerait le composant,
      // `hitSlop` porte sa seule zone tactile aux 44 pt du design system.
      hitSlop={6}
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, style]}
    >
      {content}
    </Pressable>
  );
}
