import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { goBack } from 'expo-router/build/global-state/routing';
import { useRouter } from 'expo-router';

export default function UserInfos1() {

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const router = useRouter();

  const handleSubmit = () => {
    if (!userName || !email || !password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setError('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
                <TouchableOpacity onPress={() => router.back()} >
                  <Ionicons name="chevron-back" size={34} color="black" />

        </TouchableOpacity>
        <Text style={styles.title}>Modifier mes informations</Text>

      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <View style={[
          styles.inputWrapper,
          emailFocused && styles.inputFocused
        ]}>
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
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
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText} onPress={handleSubmit}>Enregistrer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    padding: 20,
    backgroundColor: '#fff',
  },
  titleContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    fontFamily: 'Urbanist',
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
  button: {
    margin: 60,
    paddingHorizontal: 0,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: '#CDFBE2'
  },
  buttonText: { color: '#000', fontSize: 18 },
});