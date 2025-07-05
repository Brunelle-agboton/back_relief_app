import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useRouter }             from 'expo-router';
import { getToken }              from '../../../utils/storage';

type RootStackParamList = {
  'screens/RegisterStep1Screen': undefined;
  'screens/LoginScreen': undefined;
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = await getToken();
     
    })();
  }, []);
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue</Text>
      <Text style={styles.subtitle}>sur BackRelief Play</Text>
      <Text style={styles.description}>
        votre allié santé pour réduire les douleurs liées à la sédentarité et améliorer votre bien-être au quotidien.
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.SignupButton}
          onPress={() => navigation.navigate('screens/RegisterStep1Screen')} // Redirection vers la page d'inscription
        >
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('screens/LoginScreen')} // Redirection vers la page de connexion
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#32CD32', // Couleur de fond similaire à l'image
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    width: '50%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f8bb54',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 28,
  },
  SignupButton: {
    width: '50%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ED6A5E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 28,
  },
  buttonText: {
    color: '#32CD32',
    fontSize: 16,
    fontWeight: 'bold',
  },
});