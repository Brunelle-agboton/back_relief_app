import React from 'react';
import { View } from 'react-native';

import { makeStyles, px } from '@/theme';

import { Text } from './Text';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.md,
    paddingVertical: px(11),
    paddingHorizontal: px(14),
  },
}));

export interface FormErrorProps {
  /** Message à afficher. Le composant ne rend rien si la valeur est vide. */
  message?: string | null;
  testID?: string;
}

/**
 * Erreur de formulaire.
 *
 * Le design ne définit pas de bandeau d'erreur : l'apparence reprend le rayon
 * et le rembourrage d'une carte, sur l'aplat `dangerSoft`.
 *
 * `accessibilityLiveRegion` et `accessibilityRole="alert"` font annoncer le
 * message par les lecteurs d'écran au moment où il apparaît, sans que
 * l'utilisateur ait à revenir dessus.
 */
export function FormError({ message, testID }: FormErrorProps) {
  const styles = useStyles();

  if (!message) {
    return null;
  }

  return (
    <View
      style={styles.root}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text variant="bodySm" color="danger">
        {message}
      </Text>
    </View>
  );
}
