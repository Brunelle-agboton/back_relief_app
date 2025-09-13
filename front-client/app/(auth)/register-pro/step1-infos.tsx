import React, { useState } from 'react';
import { ScrollView, View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { EstablishmentType } from '@/interfaces/enum';
import api from '@/services/api';

export default function RegisterProStep1Screen() {
  const router = useRouter();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [adresse, setAdresse] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [establishmentType, setEstablishmentType] = useState<EstablishmentType | ''>('');
  const [professionalType, setProfessionalType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const options: { label: string; value: EstablishmentType }[] = [
    { label: EstablishmentType.CANADIAN_HEALTH_FACILITY, value: EstablishmentType.CANADIAN_HEALTH_FACILITY },
    { label: EstablishmentType.FRENCH_HEALTH_FACILITY, value: EstablishmentType.FRENCH_HEALTH_FACILITY },
    { label: EstablishmentType.PRIVATE_CLINIC, value: EstablishmentType.PRIVATE_CLINIC },
  ];

  const handleNext = async () => {
    // Simple validation
    if (!userName || !email || !password || !phone || !adresse || !city || !postalCode || !country || !establishmentType || !professionalType) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setError('');

    try {
      const res = await api.post('/user/register', {
        email,
        password,
        userName,
        role: 'practitioner',
      });
      const userId = res.data.id;
      router.push({
        pathname: '/register-pro/step2-specialities', // Le chemin correct
        params: {
          userId, phone, adresse, city, postalCode, country,
          establishmentType, professionalType, licenseNumber
        }
      });

    } catch (e) {
      setError('Erreur lors de l\'inscription');
    }

  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Créer un compte pro</Text>
      <Text style={styles.description}>
        Renseignez vos informations
      </Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <View style={styles.inputWrapper}>
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
            keyboardType="email-address"
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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Téléphone</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Numéro de téléphone"
            onChangeText={setPhone}
            value={phone}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Adresse</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Adresse"
            onChangeText={setAdresse}
            value={adresse}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ville</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ville"
            onChangeText={setCity}
            value={city}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Code Postal</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Code Postal"
            onChangeText={setPostalCode}
            value={postalCode}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pays</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Pays"
            onChangeText={setCountry}
            value={country}
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Picker
          selectedValue={establishmentType}
          onValueChange={(value) => setEstablishmentType(value as EstablishmentType | '')}
          mode="dialog" // ou "dialog" sur Android selon préférence
          prompt="Choisir un type"
          dropdownIconColor="#666"
          accessibilityLabel="Type d'établissement"
          style={styles.picker && styles.input && styles.inputFocused}
        >
          {/* Placeholder non sélectionnable */}
          <Picker.Item label="Sélectionner un type..." value="" style={styles.label} />
          {options.map(opt => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fonction professionnelle</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ex: Kinésiologue, Physiothérapeute"
            onChangeText={setProfessionalType}
            value={professionalType}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Numéro professionnel (Optionnel)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Numéro de licence"
            onChangeText={setLicenseNumber}
            value={licenseNumber}
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
    // justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
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
    overflow: 'hidden', // Empêche le débordement du fond
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
    // width: '100%' // facultatif
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