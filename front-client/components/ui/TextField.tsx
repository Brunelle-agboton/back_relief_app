import React, { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { makeStyles, px, useTheme } from '@/theme';

import { Text } from './Text';

const useStyles = makeStyles((theme) => ({
  root: {
    gap: theme.spacing.sm,
  },
  // Dérivé de `.pa-card-line` : surface, rayon `--radius`, contour `--line`.
  field: {
    backgroundColor: theme.colors.field,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingVertical: px(11),
    paddingHorizontal: px(14),
  },
  focused: {
    borderColor: theme.colors.focus,
  },
  errored: {
    borderColor: theme.colors.danger,
  },
  disabled: {
    backgroundColor: theme.colors.fieldDisabled,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.ink,
    // Neutralise la hauteur minimale que le moteur de texte Android impose,
    // afin que le rembourrage du champ reste celui du design.
    padding: 0,
  },
}));

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  /** Message d'erreur. Sa présence colore le contour et remplace l'indication. */
  error?: string;
  /** Indication sous le champ, masquée lorsqu'une erreur est affichée. */
  hint?: string;
}

/**
 * Champ de saisie du design system.
 *
 * Le design ne spécifie pas de champ de formulaire : l'apparence est dérivée de
 * `.pa-card-line` — surface, rayon `--radius`, contour `--line` — le contour
 * passant à `--accent` au focus et à `--danger` en erreur.
 */
export function TextField({
  label,
  error,
  hint,
  editable = true,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const styles = useStyles();
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.root}>
      {label ? (
        <Text variant="label" color="ink2">
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.field,
          focused && styles.focused,
          !!error && styles.errored,
          !editable && styles.disabled,
        ]}
      >
        <TextInput
          style={styles.input}
          editable={editable}
          placeholderTextColor={theme.colors.muted}
          accessibilityLabel={label}
          accessibilityState={{ disabled: !editable }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
      </View>

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
