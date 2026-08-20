import React from 'react';
import { View, type ViewProps } from 'react-native';

import { makeStyles } from '@/theme';

const useStyles = makeStyles((theme) => ({
  // `.pa-divider` : 1 px de `--line`.
  divider: {
    height: 1,
    backgroundColor: theme.colors.line,
  },
}));

export function Divider({ style, ...rest }: ViewProps) {
  const styles = useStyles();
  return <View style={[styles.divider, style]} {...rest} />;
}
