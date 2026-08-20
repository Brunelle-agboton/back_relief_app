import React from 'react';
import { View, type ViewProps } from 'react-native';

import { makeStyles, px } from '@/theme';

/** `.pa-card`, `.pa-card-soft` et `.pa-card-line` du design. */
export type CardVariant = 'plain' | 'soft' | 'line';

const useStyles = makeStyles((theme) => ({
  base: {
    borderRadius: theme.radius.lg,
    padding: px(14),
  },
  plain: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.card,
  },
  soft: {
    backgroundColor: theme.colors.surfaceSoft,
  },
  line: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
}));

export interface CardProps extends ViewProps {
  variant?: CardVariant;
}

export function Card({ variant = 'plain', style, ...rest }: CardProps) {
  const styles = useStyles();
  return <View style={[styles.base, styles[variant], style]} {...rest} />;
}
