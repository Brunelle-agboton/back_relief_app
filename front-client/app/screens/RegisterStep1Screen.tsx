import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Image } from 'react-native';
import { useNavigation,NavigationProp } from '@react-navigation/native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  'screens/RegisterStep2Screen': { userName: string; email: string; password: string };
};

export default function RegisterStep1Screen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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
    navigation.navigate('screens/RegisterStep2Screen', { userName, email, password });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/BF.png')}
        style={styles.logo}
        testID="logo-image"
      />
    <Text style={styles.title}>Créer un compte</Text>
    <View>
      <Text style={{ marginBottom: 8 }}>Username</Text>
      <TextInput
      style={styles.input}
      placeholder="Nom d'utilisateur"
      onChangeText={setUserName}
      value={userName}
    />
    </View>

    <View>
    <Text style={{ marginBottom: 8 }}>Email</Text>
    <TextInput
      style={styles.input}
      placeholder="Email"
      keyboardType="email-address"
      onChangeText={setEmail}
      value={email}
    />
    </View>

    <View>
    <Text style={{ marginBottom: 8 }}>Mot de passe</Text>
    <TextInput
      style={styles.input}
      placeholder="Mot de passe"
      secureTextEntry
      onChangeText={setPassword}
      value={password}
    />
    </View>
    
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <Button title="Suivant" onPress={handleNext} />
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
title: {
  fontSize: 24,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 20,
  color: '#333',
},
input: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 10,
  marginBottom: 16,
  backgroundColor: '#f9f9f9',
},
error: {
  color: 'red',
  marginBottom: 16,
  textAlign: 'center',
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