import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  '/(auth)/register/step1': undefined;
  '/(auth)/login': undefined;
};

export default function Home() {
  const router = useRouter();
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
          onPress={() =>  router.push('/(auth)/register/step1')} // Redirection vers la page d'inscription
        >
          {/* S'inscrire */}
          <Text style={styles.buttonText}>Je suis un particulier</Text> 
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>  router.push('/(auth)/login')} // Redirection vers la page de connexion
        >
          {/* Se connecter */}
          <Text style={styles.buttonText}>Je suis un professionnel</Text>
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
    fontSize: 52,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 38,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 36,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 62,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 46,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    // borderWidth: 1,
    borderColor: '#f8bb54',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
  },
  SignupButton: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    // borderWidth: 1,
    // borderColor: '#ED6A5E',
    paddingVertical: 14,
    paddingHorizontal: 34,
    borderRadius: 28,
  },
  buttonText: {
    color: '#32CD32',
    fontSize: 16,
    fontWeight: 'bold',
  },
});