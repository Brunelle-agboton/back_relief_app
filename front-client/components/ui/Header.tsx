import React from 'react';
import { View } from 'react-native';

import { makeStyles } from '@/theme';

import { Text } from './Text';

const useStyles = makeStyles((theme) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  titles: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
}));

export interface HeaderProps {
  /** Sur-titre en petites capitales. Le design le colore en `--accent-deep`. */
  kicker?: string;
  title: string;
  sub?: string;
  /** Contenu aligné à droite : pastille de série, action… */
  right?: React.ReactNode;
}

/** En-tête d'écran, transcrit du composant `Header` du design. */
export function Header({ kicker, title, sub, right }: HeaderProps) {
  const styles = useStyles();

  return (
    <View style={styles.root}>
      <View style={styles.titles}>
        {kicker ? (
          <Text variant="meta" color="accentDeep">
            {kicker}
          </Text>
        ) : null}
        <Text variant="h1">{title}</Text>
        {sub ? <Text variant="sub">{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}
