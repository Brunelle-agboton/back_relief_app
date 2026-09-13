import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/theme';
import type { ThemeColors, TypographyVariant } from '@/theme';

/** Rôles de couleur admissibles pour du texte. */
export type TextColor = Extract<
  keyof ThemeColors,
  | 'ink'
  | 'ink2'
  | 'muted'
  | 'accent'
  | 'accentDeep'
  | 'onAccent'
  | 'good'
  | 'goodDeep'
  | 'onGood'
  | 'warn'
  | 'danger'
  | 'dangerDeep'
  | 'streak'
>;

export interface TextProps extends RNTextProps {
  /** Variante du barème typographique du design. */
  variant?: TypographyVariant;
  /** Rôle de couleur. Par défaut, celui que le design associe à la variante. */
  color?: TextColor;
}

/**
 * Couleur par défaut de chaque variante, telle que le design l'associe :
 * `.pa-sub` est en `--ink-2`, `.pa-meta` en `--muted`, le reste en `--ink`.
 */
const DEFAULT_COLOR: Partial<Record<TypographyVariant, TextColor>> = {
  sub: 'ink2',
  meta: 'muted',
  caption: 'muted',
};

/**
 * Texte du design system.
 *
 * À préférer systématiquement au `Text` de React Native : la variante porte à
 * la fois la taille, la graisse, l'interligne et l'interlettrage définis par le
 * design, et la couleur suit le thème actif.
 */
export function Text({ variant = 'body', color, style, ...rest }: TextProps) {
  const theme = useTheme();
  const role = color ?? DEFAULT_COLOR[variant] ?? 'ink';

  return (
    <RNText
      // La variante porte déjà famille, graisse, taille et interlettrage : seule
      // la couleur s'y ajoute.
      style={[theme.typography[variant], { color: theme.colors[role] }, style]}
      {...rest}
    />
  );
}
