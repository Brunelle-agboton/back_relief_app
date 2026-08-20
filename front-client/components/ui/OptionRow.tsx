import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { makeStyles, px, useTheme } from '@/theme';

import { Text } from './Text';

const useStyles = makeStyles((theme) => ({
  // `OnbLifestyle` : rangée pleine largeur, 12 px / 14 px de padding, contour
  // de 1.5 px qui passe à l'accent une fois l'option retenue.
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: px(12),
    paddingHorizontal: px(14),
    borderRadius: px(14),
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  },
  rootSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  labels: {
    flex: 1,
    gap: px(1),
  },
  pressed: {
    opacity: 0.8,
  },
}));

export interface OptionRowProps {
  label: string;
  /** Précision affichée sous le libellé, comme les niveaux d'activité. */
  description?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * Rangée d'option sélectionnable, transcrite des listes de `OnbLifestyle`.
 *
 * `accessibilityRole="radio"` plutôt que `button` : ces rangées forment un
 * choix exclusif, et c'est ce que doit annoncer un lecteur d'écran.
 */
export function OptionRow({
  label,
  description,
  selected,
  onPress,
  disabled = false,
  testID,
}: OptionRowProps) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={description ? `${label}, ${description}` : label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.root, selected && styles.rootSelected, pressed && styles.pressed]}
    >
      <View style={styles.labels}>
        <Text variant={description ? 'bodyStrong' : 'body'} color={selected ? 'accentDeep' : 'ink'}>
          {label}
        </Text>
        {description ? <Text variant="caption">{description}</Text> : null}
      </View>

      {selected ? (
        <Ionicons name="checkmark" size={px(16)} color={theme.colors.accentDeep} />
      ) : null}
    </Pressable>
  );
}
