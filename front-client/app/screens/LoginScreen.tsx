import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { Link } from 'expo-router';
import api from '../../services/api';
import { saveToken } from '../../utils/storage';
import {useNavigation, NavigationProp } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

type RootStackParamList = {
  'screens/RegisterHealthScreen': undefined;
  'screens/RegisterStep1Screen' : undefined;
};

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const res = await api.post('/user/login', { email, password });
      const token = res.data?.access_token;
      if (!token) {
        throw new Error('Token manquant dans la réponse');
      }
  
      // Stocke le token pour les prochains appels API
      login(token);
      await saveToken(token);   
        router.replace('/(tabs)');
      //console.log('Navigation vers RegisterHealthScreen réussie');
    } catch (e) {
      setError('Identifiants invalides');
    }
  };
 return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/icon.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Se connecter</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <View style={[
          styles.inputWrapper,
          emailFocused && styles.inputFocused
        ]}>
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            placeholderTextColor="#999"
            onChangeText={setEmail} 
            value={email}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mot de passe</Text>
        <View style={[
          styles.inputWrapper,
          passwordFocused && styles.inputFocused
        ]}>
          <TextInput 
            style={styles.input} 
            placeholder="Mot de passe" 
            placeholderTextColor="#999"
            secureTextEntry 
            onChangeText={setPassword} 
            value={password}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
        </View>
      </View>

      <Link href="/screens/ForgotPasswordScreen" style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
      </Link>

      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin}
      >
        <Text style={styles.loginButtonText}>Se connecter</Text>
      </TouchableOpacity>

      <Text style={styles.signupText}>
        Pas encore inscrit ?{' '}
        <Text 
          style={styles.signupLink} 
          onPress={() => navigation.navigate('screens/RegisterStep1Screen')}
        >
          Créer un compte
        </Text>
      </Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 120,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    color: '#555',
  },
  inputWrapper: {
    borderRadius: 30,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden', // Empêche le débordement du fond
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    padding: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
  },
  inputFocused: {
    borderColor: '#FFAE00',
    backgroundColor: '#fffdf6',
    shadowColor: '#FFAE00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  forgotPassword: {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  forgotPasswordText: {
    color: '#32CD32',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#32CD32',
    borderRadius: 29,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  },
  signupLink: {
    color: '#32CD32',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 16,
    textAlign: 'center',
  },
});