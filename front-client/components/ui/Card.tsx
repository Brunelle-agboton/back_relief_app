import React from 'react';
import { View, type ViewProps } from 'react-native';

import { makeStyles } from '@/theme';

/**
 * Variantes de carte.
 *
 * Le design system décrit une carte bordée — rayon `--radius`, bordure de 1 px,
 * rembourrage 16 — là où le kit d'origine la décrivait ombrée et plus arrondie.
 * C'est le design system qui fait foi : `plain` est donc bordée. `elevated`
 * conserve `--shadow-card`, que le design system documente toujours, pour les
 * cartes qui doivent se détacher du fond.
 */
export type CardVariant = 'plain' | 'soft' | 'elevated';

const useStyles = makeStyles((theme) => ({
  base: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  plain: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  soft: {
    backgroundColor: theme.colors.surfaceSoft,
  },
  elevated: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.card,
  },
}));

export interface CardProps extends ViewProps {
  variant?: CardVariant;
}

export function Card({ variant = 'plain', style, ...rest }: CardProps) {
  const styles = useStyles();
  return <View style={[styles.base, styles[variant], style]} {...rest} />;
}
