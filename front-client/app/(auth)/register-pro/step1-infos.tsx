import React, { useState } from 'react';
import { ScrollView, View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterProStep1Screen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleNext = async () => {
    // Simple validation
    if (!firstName || !lastName || !email || !password || !phone ) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setError('');
    const userName = firstName + " " + lastName;
    // try {
    //   const res = await api.post('/user/register', {
    //     email,
    //     password,
    //     userName,
    //     role: 'practitioner',
    //   });
    //   const userId = res.data.id;
      router.push({
        pathname: '/register-pro/step1-infos-exercices',
        params: {
          userName,  email, password, phone
        }
      });

    // } catch (e) {
    //   setError('Erreur lors de l\'inscription');
    // }

  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Créer un compte pro</Text>
      <Text style={styles.description}>
        Renseignez vos informations
      </Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nom</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Votre nom et prenom d'utilisateur"
            onChangeText={setLastName}
            value={lastName}
          />
        </View>
      </View>

        <View style={styles.inputContainer}>
        <Text style={styles.label}>Prénom</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Votre nom et prenom d'utilisateur"
            onChangeText={setFirstName}
            value={firstName}
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
            placeholder="Votre Email"
            placeholderTextColor="#999"
            onChangeText={setEmail}
            value={email}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            keyboardType="email-address"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Téléphone</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Votre Numéro de téléphone"
            onChangeText={setPhone}
            value={phone}
            keyboardType="phone-pad"
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
            placeholder="Votre Mot de passe"
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginTop: 66,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    textAlign: 'center',
    color: '#FF8C00',
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 12,
    fontSize: 14,
    color: '#555',
  },
  inputWrapper: {
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden', 
    borderWidth: 1,
    paddingVertical: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'flex-start',
    textAlign: 'center',
  },
  input: {
    padding: 15,
    paddingHorizontal: 2,
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
  picker: {
    height: 48,
    borderWidth: 0,
    // width: '100%'
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
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