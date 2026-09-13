import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { makeStyles, px, useTheme } from '@/theme';

import { MIN_HIT_TARGET } from './Button';
import { Text } from './Text';

const TOGGLE_SIZE = px(30);

const useStyles = makeStyles((theme) => ({
  root: {
    gap: px(6),
  },
  // Design system : rayon `--radius`, rembourrage 12 / 14, bordure de 1 px.
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_HIT_TARGET,
    backgroundColor: theme.colors.field,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingVertical: px(12),
    paddingLeft: px(14),
    paddingRight: px(14),
  },
  // Réserve la place du révélateur, qui se superpose au champ.
  fieldWithToggle: {
    paddingRight: TOGGLE_SIZE + px(6),
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
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.ink,
    // Neutralise la hauteur minimale que le moteur de texte Android impose,
    // afin que le rembourrage du champ reste celui du design.
    padding: 0,
  },
  // Positionné hors du flux : mesurant 37.5 pt, il rendait sinon le champ de
  // mot de passe plus haut que les autres, l'interligne du texte n'en faisant
  // que 22. Sa zone tactile couvre toute la hauteur du champ, donc les 44 pt.
  toggle: {
    position: 'absolute',
    right: px(6),
    top: 0,
    bottom: 0,
    width: TOGGLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePressed: {
    opacity: 0.6,
  },
}));

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  /** Message d'erreur. Sa présence colore le contour et remplace l'indication. */
  error?: string;
  /** Indication sous le champ, masquée lorsqu'une erreur est affichée. */
  hint?: string;
  /**
   * Bouton de révélation du mot de passe. Actif par défaut dès que
   * `secureTextEntry` est demandé.
   */
  showVisibilityToggle?: boolean;
}

/**
 * Champ de saisie du design system.
 *
 * Le design ne définit pas de composant de formulaire réutilisable, mais fixe
 * l'apparence des champs du parcours d'inscription (`onbInputStyle`) et le
 * libellé en petites capitales qui les surmonte (`OnbField`) : c'est cette
 * apparence qui est reprise ici, le contour passant à `--accent` au focus et à
 * `--danger` en erreur.
 */
export function TextField({
  label,
  error,
  hint,
  editable = true,
  secureTextEntry = false,
  showVisibilityToggle = true,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const styles = useStyles();
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const withToggle = secureTextEntry && showVisibilityToggle;

  return (
    <View style={styles.root}>
      {label ? <Text variant="meta">{label}</Text> : null}

      <View
        style={[
          styles.field,
          withToggle && styles.fieldWithToggle,
          focused && styles.focused,
          !!error && styles.errored,
          !editable && styles.disabled,
        ]}
      >
        <TextInput
          style={styles.input}
          editable={editable}
          secureTextEntry={secureTextEntry && !revealed}
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

        {withToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            onPress={() => setRevealed((value) => !value)}
            style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
          >
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={px(16)}
              color={theme.colors.muted}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" color="dangerDeep">
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
