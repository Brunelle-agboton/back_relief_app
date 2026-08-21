import React from 'react';
import { View } from 'react-native';

import { makeStyles } from '@/theme';

import { Text } from './Text';

export type FormMessageTone = 'error' | 'success';

const useStyles = makeStyles((theme) => ({
  base: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  error: {
    backgroundColor: theme.colors.dangerSoft,
  },
  success: {
    backgroundColor: theme.colors.goodSoft,
  },
}));

/**
 * Couleur du texte par tonalité — toujours la variante contrastée, jamais la
 * couleur d'aplat. `good` plafonne à 1.74:1 sur fond clair en ambiance brume,
 * et `danger` sur `dangerSoft` reste sous le seuil dans les trois ambiances.
 */
const TEXT_COLOR = {
  error: 'dangerDeep',
  success: 'goodDeep',
} as const;

export interface FormMessageProps {
  /** Message à afficher. Le composant ne rend rien si la valeur est vide. */
  message?: string | null;
  tone?: FormMessageTone;
  testID?: string;
}

/**
 * Message de formulaire — erreur de soumission, confirmation d'envoi.
 *
 * `accessibilityRole="alert"` et `accessibilityLiveRegion` font annoncer le
 * message par les lecteurs d'écran au moment où il apparaît, sans que
 * l'utilisateur ait à revenir dessus.
 */
export function FormMessage({ message, tone = 'error', testID }: FormMessageProps) {
  const styles = useStyles();

  if (!message) {
    return null;
  }

  return (
    <View
      style={[styles.base, styles[tone]]}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text variant="bodySm" color={TEXT_COLOR[tone]}>
        {message}
      </Text>
    </View>
  );
}
