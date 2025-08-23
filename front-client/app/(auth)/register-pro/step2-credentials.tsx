import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { useNavigation,NavigationProp } from '@react-navigation/native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  '/(auth)/register/step2-credentials': { userName: string; email: string; password: string };
};

export default function RegisterStep1Screen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleNext = () => {
    if (!userName || !email || !password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setError('');
    navigation.navigate('/(auth)/register/step2-credentials', { userName, email, password });
  };

  return (
    <View style={styles.container}>
      {/* <Image
        source={require('@/assets/images/icon.png')}
        style={styles.logo}
        testID="logo-image"
      /> */}
<Text style={styles.description}>Vos spécialités </Text>
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Username</Text>
     <View style={[
              styles.inputWrapper,
              emailFocused && styles.inputFocused
            ]}>
      <TextInput
            style={styles.input}
            placeholder="Votre nom et prenom d'utilisateur"
            onChangeText={setUserName}
            value={userName}
          />
      </View>
    </View>

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
    
    {error ? <Text style={styles.error}>{error}</Text> : null}
 <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: 16 }}>
   <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.85}>
     <Text style={styles.buttonText}>Suivant</Text>
   </TouchableOpacity>
 </View>
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
  description: {
    textAlign: 'center',
    color: '#FF8C00',
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
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
 button: { 
 backgroundColor: '#FFFFFF',      // fond blanc comme sur ton image
    borderRadius: 30,                // forme "pill"
    paddingVertical: 12,
  marginTop: 16,

    // ombre iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, // décalage bas pour effet levé
    shadowOpacity: 0.08,
    shadowRadius: 12,
    // ombre Android
    elevation: 6,
    // optionnel : largeur fixe si nécessaire
   width: 140,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  buttonText: {
    color: '#6b6b6b', // gris doux
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});