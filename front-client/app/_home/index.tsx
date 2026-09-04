import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, View } from 'react-native';

import { Button, ScrollScreen, Text } from '@/components/ui';
import { makeStyles, px } from '@/theme';

const BADGE = px(84);

const useStyles = makeStyles((theme) => ({
  // `OnbWelcome` : médaillon d'aplat clair, illustration centrée.
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: theme.colors.accentSoft,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: px(58),
    height: px(58),
    resizeMode: 'contain',
  },
  intro: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  centered: {
    textAlign: 'center',
  },
  actions: {
    gap: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xxs,
  },
}));

export default function Home() {
  const router = useRouter();
  const styles = useStyles();

  return (
    <ScrollScreen centered>
      <View style={styles.badge}>
        <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
      </View>

      <View style={styles.intro}>
        <Text variant="h1" style={styles.centered}>
          Bienvenue sur BackRelief
        </Text>
        <Text variant="sub" style={styles.centered}>
          Quelques informations suffisent pour personnaliser vos pauses actives et suivre vos
          progrès.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          accessibilityLabel="Je suis un particulier"
          title="Je suis un particulier"
          size="lg"
          block
          onPress={() => router.push('/(auth)/register/step1')}
        />
        <Button
          accessibilityLabel="Je suis un professionnel"
          title="Je suis un professionnel"
          variant="secondary"
          size="lg"
          block
          onPress={() => router.push('/(auth)/login')}
        />
      </View>

      {/*
        Le design conclut sur ce rappel, absent de l'écran jusqu'ici : un patient
        déjà inscrit n'avait aucune entrée évidente, les deux boutons annonçant
        une création de compte.
      */}
      <View style={styles.footer}>
        <Text variant="sub">Déjà un compte ?</Text>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Se connecter"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text variant="bodyStrong" color="accentDeep">
            Se connecter
          </Text>
        </Pressable>
      </View>
    </ScrollScreen>
  );
}
