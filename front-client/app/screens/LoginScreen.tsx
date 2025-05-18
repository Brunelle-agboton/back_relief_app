import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Image } from 'react-native';
import api from '../../services/api';
import { saveToken } from '../../utils/storage';
import {useNavigation, NavigationProp } from '@react-navigation/native';
import { useRouter } from 'expo-router';

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

  const handleLogin = async () => {
    try {
      const res = await api.post('/user/login', { email, password });
      const token = res.data?.access_token;
      if (!token) {
        throw new Error('Token manquant dans la réponse');
      }
  
      // Stocke le token pour les prochains appels API
      await saveToken(token);   
      router.push('/(tabs)/pauseActive/pauseActive');
      console.log('Navigation vers RegisterHealthScreen réussie');
    } catch (e) {
      setError('Identifiants invalides');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/BF.png')}
        style={styles.logo}
      />
      <Text style={{ fontSize: 28,fontWeight: 'bold', marginBottom: 16 }}>Se connecter</Text>

      <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8 }}>Email</Text>
        <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} value={email} />
      </View>

      <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8 }}>Mot de passe</Text>
          <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry onChangeText={setPassword} value={password} />
      </View>

      <View style={styles.buttonContainer}>
      <Button title="Se connecter" onPress={handleLogin} />
      <Button title="S'inscrire" onPress={() => navigation.navigate('screens/RegisterStep1Screen')} />
      </View>
      {error ? <Text>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#32CD32',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 8,
    marginTop: 16,
},
});