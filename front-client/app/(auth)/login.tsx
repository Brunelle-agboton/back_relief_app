import { Link, useRouter } from 'expo-router';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, Pressable, View } from 'react-native';

import { Button, FormMessage, ScrollScreen, Text, TextField } from '@/components/ui';
import { makeStyles, px } from '@/theme';

import { isEnabled } from '../../config/featureFlags';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { saveToken } from '../../utils/storage';

type RootStackParamList = {
  'screens/RegisterHealthScreen': undefined;
  'register-pro/step1-infos': undefined;
  'register/step1': undefined;
};

const useStyles = makeStyles((theme) => ({
  // Reprend le médaillon de l'écran de bienvenue du design : disque d'aplat
  // clair, illustration centrée.
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
  forgotPassword: {
    alignSelf: 'flex-start',
  },
  footer: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xxs,
  },
}));

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const router = useRouter();
  const styles = useStyles();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/user/login', { email, password });
      const token = res.data?.access_token;
      if (!token) {
        throw new Error('Token manquant dans la réponse');
      }

      // Stocke le token pour les prochains appels API. `login` retourne le
      // profil décodé : `authState` n'est pas encore à jour à cet instant.
      const user = login(token);
      await saveToken(token);

      // L'espace praticien n'est ouvert que si la feature est activée ;
      // sinon un praticien est renvoyé vers l'espace patient.
      if (user.role === 'practitioner' && isEnabled('proDashboard')) {
        router.replace('/(pro)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      console.log(e);
      setError('Identifiants invalides');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollScreen centered>
      <View style={styles.logoBadge}>
        <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
      </View>

      <View>
        <Text variant="h1">Connexion</Text>
        <Text variant="sub">Retrouvez vos pauses actives et votre suivi.</Text>
      </View>

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
        autoComplete="password"
        secureTextEntry
      />

      <Link href="/(auth)/forgot-password" style={styles.forgotPassword}>
        <Text variant="label" color="accentDeep">
          Mot de passe oublié ?
        </Text>
      </Link>

      <FormMessage message={error} testID="login-error" />

      <Button
        testID="login-button"
        accessibilityLabel="Se connecter"
        title="Se connecter"
        size="lg"
        block
        loading={submitting}
        onPress={handleLogin}
      />

      <View style={styles.footer}>
        <Text variant="sub">Pas encore inscrit ?</Text>

        <Pressable onPress={() => navigation.navigate('register/step1')}>
          <Text variant="bodyStrong" color="accentDeep">
            Créer un compte patient
          </Text>
        </Pressable>

        <Text variant="caption">ou</Text>

        <Pressable onPress={() => navigation.navigate('register-pro/step1-infos')}>
          <Text variant="bodyStrong" color="accentDeep">
            Créer un compte professionnel
          </Text>
        </Pressable>
      </View>
    </ScrollScreen>
  );
}
