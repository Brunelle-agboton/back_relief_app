import React from 'react';
import { ScrollView, View, type ScrollViewProps, type ViewProps } from 'react-native';

import { makeStyles } from '@/theme';

const useStyles = makeStyles((theme) => ({
  // `.pa-screen` : fond `--bg`, marge horizontale de 16 px et gouttière
  // verticale de 13 px dans le design, mises à l'échelle de l'appareil.
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  padded: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.lg,
  },
  /** Écrans d'authentification : contenu centré verticalement. */
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
}));

export interface ScreenProps extends ViewProps {
  /** Retire la marge et la gouttière — pour un écran qui gère sa propre mise en page. */
  flush?: boolean;
  /** Centre le contenu verticalement, comme les écrans d'authentification. */
  centered?: boolean;
}

/** Conteneur d'écran : applique le fond et le rythme définis par `.pa-screen`. */
export function Screen({ flush = false, centered = false, style, ...rest }: ScreenProps) {
  const styles = useStyles();

  return (
    <View
      style={[styles.root, !flush && styles.padded, centered && styles.centered, style]}
      {...rest}
    />
  );
}

export interface ScrollScreenProps extends ScrollViewProps {
  centered?: boolean;
}

/** Variante défilante, pour les écrans dont le contenu dépasse la hauteur. */
export function ScrollScreen({ centered = false, contentContainerStyle, ...rest }: ScrollScreenProps) {
  const styles = useStyles();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scrollContent, centered && styles.centered, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      {...rest}
    />
  );
}
