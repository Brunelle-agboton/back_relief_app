import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, View } from 'react-native';

import {
  Button,
  FormMessage,
  ScrollScreen,
  StepHeader,
  StepProgress,
  Text,
  TextField,
} from '@/components/ui';
import { makeStyles, px } from '@/theme';

/** Le parcours d'inscription patient compte trois étapes. */
export const REGISTER_STEP_COUNT = 3;

const useStyles = makeStyles((theme) => ({
  // Médaillon de l'écran de bienvenue du design : disque d'aplat clair.
  logoBadge: {
    width: px(84),
    height: px(84),
    borderRadius: px(42),
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xxs,
  },
}));

export default function RegisterStep1Screen() {
  const router = useRouter();
  const styles = useStyles();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!userName || !email || !password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setError('');
    router.push({
      pathname: '/register/step2',
      params: { userName, email, password },
    });
  };

  return (
    <ScrollScreen>
      <StepHeader step={0} count={REGISTER_STEP_COUNT} />
      <StepProgress step={0} count={REGISTER_STEP_COUNT} />

      <View style={styles.logoBadge}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          testID="logo-image"
        />
      </View>

      <View>
        <Text variant="h1">Créer un compte</Text>
        <Text variant="sub">Renseignez vos identifiants pour démarrer.</Text>
      </View>

      <TextField
        label="Nom d'utilisateur"
        placeholder="Nom d'utilisateur"
        value={userName}
        onChangeText={setUserName}
        autoCapitalize="none"
      />

      <TextField
        label="Adresse e-mail"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />

      <TextField
        label="Mot de passe"
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        secureTextEntry
      />

      <FormMessage message={error} testID="step1-error" />

      <Button
        accessibilityLabel="Suivant"
        title="Suivant"
        size="lg"
        block
        onPress={handleNext}
      />

      <View style={styles.footer}>
        <Text variant="sub">Déjà un compte ?</Text>
        <Pressable onPress={() => router.push('/login')}>
          <Text variant="bodyStrong" color="accentDeep">
            Me connecter
          </Text>
        </Pressable>
      </View>
    </ScrollScreen>
  );
}
