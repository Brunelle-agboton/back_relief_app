import React, { useState } from 'react';
import { ScrollView, View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;

export default function RegisterProStep1Screen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isPhoneValid, setIsPhoneValid] = useState(true);

  const validateEmail = (text: string) => {
    setEmail(text);
    setIsEmailValid(emailRegex.test(text));
  };

  const validatePassword = (text: string) => {
    setPassword(text);
    setIsPasswordValid(passwordRegex.test(text));
  };

  const validatePhone = (text: string) => {
    setPhone(text);
    setIsPhoneValid(phoneRegex.test(text));
  };

  const handleNext = async () => {
    if (!firstName || !lastName || !email || !password || !phone) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    if (!isEmailValid || !isPasswordValid || !isPhoneValid) {
      setError('Veuillez corriger les champs en rouge.');
      return;
    }

    setError('');
    const userName = firstName + " " + lastName;
    router.push({
      pathname: '/register-pro/step1-infos-exercices',
      params: {
        userName, email, password, phone
      }
    });
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
            placeholder="Votre nom"
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
            placeholder="Votre prenom"
            onChangeText={setFirstName}
            value={firstName}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <View style={[styles.inputWrapper, !isEmailValid && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="Votre Email"
            placeholderTextColor="#999"
            onChangeText={validateEmail}
            value={email}
            keyboardType="email-address"
          />
        </View>
        {!isEmailValid && <Text style={styles.errorText}>Veuillez saisir une adresse e-mail valide.</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Téléphone</Text>
        <View style={[styles.inputWrapper, !isPhoneValid && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="Votre Numéro de téléphone"
            onChangeText={validatePhone}
            value={phone}
            keyboardType="phone-pad"
          />
        </View>
        {!isPhoneValid && <Text style={styles.errorText}>Veuillez saisir un numéro de téléphone valide (ex: 0612345678 ou +33612345678).</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mot de passe</Text>
        <View style={[styles.inputWrapper, !isPasswordValid && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="Votre Mot de passe"
            placeholderTextColor="#999"
            secureTextEntry
            onChangeText={validatePassword}
            value={password}
          />
        </View>
        {!isPasswordValid && <Text style={styles.errorText}>Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.</Text>}
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
    marginBottom: 30,
    color: '#333',
  },
  description: {
    textAlign: 'center',
    color: '#FF8C00',
    padding: 10,
    fontSize: 16,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 8,
  },
  inputWrapper: {
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    padding: 10,
    fontSize: 14,
    color: '#333',
  },
  inputError: {
    borderColor: 'red',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    width: 140,
    alignItems: 'center',
  },
  buttonText: {
    color: '#6b6b6b',
    fontSize: 15,
    fontWeight: '500',
  },
});