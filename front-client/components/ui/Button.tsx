import React from 'react';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { makeStyles, px, useTheme } from '@/theme';

import { Text } from './Text';

/** Variantes documentées par le design system. */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'outlined' | 'ghost';
export type ButtonSize = 'md' | 'lg';

/** Zone tactile minimale imposée par le design system. */
export const MIN_HIT_TARGET = 44;

const useStyles = makeStyles((theme) => ({
  // Design system : rayon `--radius`, rembourrage 12 / 20.
  base: {
    borderRadius: theme.radius.md,
    paddingVertical: px(12),
    paddingHorizontal: px(20),
    minHeight: MIN_HIT_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  lg: {
    paddingVertical: px(14),
  },
  block: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: theme.colors.accent,
    ...theme.shadows.raised,
  },
  secondary: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
  },
  /**
   * Le design system décrit un libellé vert sur aplat vert clair, soit 1.49:1 —
   * en pratique illisible. Le rapport est inversé sur décision du client : le
   * vert devient l'aplat, le libellé prend `onGood`, et l'ambiance brume passe
   * ainsi de 1.49:1 à 8.71:1.
   */
  success: {
    backgroundColor: theme.colors.good,
    ...theme.shadows.raised,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
  },
  // Le design system fixe l'opacité des états désactivés à 0.45.
  disabled: {
    opacity: 0.45,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  contentLoading: {
    opacity: 0,
  },
  indicator: {
    position: 'absolute',
  },
}));

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Occupe toute la largeur disponible. */
  block?: boolean;
  loading?: boolean;
  /** Élément affiché avant le libellé — une icône, typiquement. */
  icon?: React.ReactNode;
}

/** Couleur du libellé pour chaque variante. */
const LABEL_COLOR = {
  primary: 'onAccent',
  secondary: 'accent',
  success: 'onGood',
  outlined: 'accent',
  ghost: 'ink2',
} as const;

/**
 * Bouton du design system.
 *
 * Le libellé conserve sa place pendant le chargement : l'indicateur se
 * superpose au lieu de le remplacer, ce qui évite au bouton de changer de
 * largeur au moment où l'utilisateur vient d'appuyer dessus.
 */
export function Button({
  title,
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  disabled = false,
  icon,
  ...rest
}: ButtonProps) {
  const styles = useStyles();
  const theme = useTheme();
  const isInactive = disabled || loading;
  const labelColor = LABEL_COLOR[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        size === 'lg' && styles.lg,
        block && styles.block,
        pressed && styles.pressed,
        isInactive && styles.disabled,
      ]}
      {...rest}
    >
      <View style={[styles.content, loading && styles.contentLoading]}>
        {icon}
        <Text variant={size === 'lg' ? 'buttonLg' : 'button'} color={labelColor}>
          {title}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.indicator} color={theme.colors[labelColor]} size="small" />
      ) : null}
    </Pressable>
  );
}
