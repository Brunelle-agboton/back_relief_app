import React from 'react';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { makeStyles, px, useTheme } from '@/theme';

import { Text } from './Text';

/** Variantes de `.pa-btn` définies par le design. */
export type ButtonVariant = 'primary' | 'soft' | 'outline' | 'ghost';
export type ButtonSize = 'md' | 'lg';

const useStyles = makeStyles((theme) => ({
  // `.pa-btn` : rayon pilule, 11 px / 18 px de padding dans le design.
  base: {
    borderRadius: theme.radius.pill,
    paddingVertical: px(11),
    paddingHorizontal: px(18),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  // `.pa-btn-lg` : 14 px / 20 px.
  lg: {
    paddingVertical: px(14),
    paddingHorizontal: px(20),
  },
  block: {
    alignSelf: 'stretch',
  },
  // `.pa-btn-primary` : aplat d'accent et ombre portée légère.
  primary: {
    backgroundColor: theme.colors.accent,
    ...theme.shadows.raised,
  },
  // `.pa-btn-soft` : aplat clair, texte en accent contrasté, sans ombre.
  soft: {
    backgroundColor: theme.colors.accentSoft,
  },
  // `.pa-btn` par défaut : surface et contour `--line` en `inset`.
  outline: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
  },
  // `.pa-btn-ghost` : sans fond ni contour.
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },
}));

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Occupe toute la largeur disponible (`.pa-btn-block`). */
  block?: boolean;
  loading?: boolean;
  /** Élément affiché avant le libellé — une icône, typiquement. */
  icon?: React.ReactNode;
}

/** Couleur du libellé pour chaque variante, d'après le design. */
const LABEL_COLOR = {
  primary: 'onAccent',
  soft: 'accentDeep',
  outline: 'ink',
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, opacity: loading ? 0 : 1 }}>
        {icon}
        <Text variant={size === 'lg' ? 'buttonLg' : 'button'} color={labelColor}>
          {title}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator
          style={{ position: 'absolute' }}
          color={theme.colors[labelColor]}
          size="small"
        />
      ) : null}
    </Pressable>
  );
}
