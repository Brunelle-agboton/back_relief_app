import React, { useState } from 'react';
import { ScrollView, View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { EstablishmentType, ProfessionalType } from '@/interfaces/enum';
import BackButton from '@/components/BackButton';

const postalCodeRegex = /^([A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d|\d{5})$/;
const licenseNumberRegex = /^[A-Za-z0-9]{5,20}$/;

export default function RegisterProStep1Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [city, setCity] = useState('');
  const [adresse, setAdresse] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [establishmentType, setEstablishmentType] = useState<EstablishmentType | ''>(EstablishmentType.PRIVATE_CLINIC);
  const [professionalType, setProfessionalType] = useState<ProfessionalType | ''>(ProfessionalType.KINESIOLOGUE);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [error, setError] = useState('');

  const [isCityValid, setIsCityValid] = useState(true);
  const [isAdresseValid, setIsAdresseValid] = useState(true);
  const [isPostalCodeValid, setIsPostalCodeValid] = useState(true);
  const [isCountryValid, setIsCountryValid] = useState(true);
  const [isEstablishmentTypeValid, setIsEstablishmentTypeValid] = useState(true);
  const [isProfessionalTypeValid, setIsProfessionalTypeValid] = useState(true);
  const [isLicenseNumberValid, setIsLicenseNumberValid] = useState(true);

  const establishmentOptions: { label: string; value: EstablishmentType }[] = [
    { label: EstablishmentType.CANADIAN_HEALTH_FACILITY, value: EstablishmentType.CANADIAN_HEALTH_FACILITY },
    { label: EstablishmentType.FRENCH_HEALTH_FACILITY, value: EstablishmentType.FRENCH_HEALTH_FACILITY },
    { label: EstablishmentType.PRIVATE_CLINIC, value: EstablishmentType.PRIVATE_CLINIC },
  ];

  const professionalOptions: { label: string; value: ProfessionalType }[] = [
    { label: ProfessionalType.KINESIOLOGUE, value: ProfessionalType.KINESIOLOGUE },
    { label: ProfessionalType.PHYSIOTHERAPIST, value: ProfessionalType.PHYSIOTHERAPIST },
    { label: ProfessionalType.ERGOTHERAPEUTE, value: ProfessionalType.ERGOTHERAPEUTE },
    { label: ProfessionalType.OTHER, value: ProfessionalType.OTHER },
  ];

  const registerPro = async () => {
    const isCityEmpty = city.trim() === '';
    const isAdresseEmpty = adresse.trim() === '';
    const isPostalCodeEmpty = postalCode.trim() === '';
    const isCountryEmpty = country.trim() === '';
    const isEstablishmentTypeEmpty = establishmentType === '';
    const isProfessionalTypeEmpty = professionalType === '';

    setIsCityValid(!isCityEmpty);
    setIsAdresseValid(!isAdresseEmpty);
    setIsPostalCodeValid(!isPostalCodeEmpty && postalCodeRegex.test(postalCode));
    setIsCountryValid(!isCountryEmpty);
    setIsEstablishmentTypeValid(!isEstablishmentTypeEmpty);
    setIsProfessionalTypeValid(!isProfessionalTypeEmpty);
    setIsLicenseNumberValid(licenseNumber.trim() === '' || licenseNumberRegex.test(licenseNumber));

    if (isCityEmpty || isAdresseEmpty || isPostalCodeEmpty || isCountryEmpty || isEstablishmentTypeEmpty || isProfessionalTypeEmpty) {
      setError('Tous les champs obligatoires doivent être remplis.');
      return;
    }

    if (!postalCodeRegex.test(postalCode) || (licenseNumber.trim() !== '' && !licenseNumberRegex.test(licenseNumber))) {
      setError('Veuillez corriger les champs en rouge.');
      return;
    }

    setError('');
    
    router.push({
      pathname: '/register-pro/step-meet-tantely',
      params: {
        ...params,
        adresse, city, postalCode, country,
        establishmentType, professionalType, licenseNumber
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
       <BackButton />
      <Text style={styles.title}>Où exercez-vous ?</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Adresse</Text>
        <View style={[styles.inputWrapper, !isAdresseValid && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="Votre Adresse"
            onChangeText={setAdresse}
            value={adresse}
          />
        </View>
        {!isAdresseValid && <Text style={styles.errorText}>L'adresse est obligatoire.</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ville</Text>
        <View style={[styles.inputWrapper, !isCityValid && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="Votre Ville"
            onChangeText={setCity}
            value={city}
          />
        </View>
        {!isCityValid && <Text style={styles.errorText}>La ville est obligatoire.</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Code Postal</Text>
        <View style={[styles.inputWrapper, !isPostalCodeValid && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="Votre Code Postal"
            onChangeText={setPostalCode}
            value={postalCode}
          />
        </View>
        {!isPostalCodeValid && <Text style={styles.errorText}>Le code postal est invalide.</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pays</Text>
        <View style={[styles.inputWrapper, !isCountryValid && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="Votre Pays"
            onChangeText={setCountry}
            value={country}
          />
        </View>
        {!isCountryValid && <Text style={styles.errorText}>Le pays est obligatoire.</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Type d'établissement</Text>
        <View style={[styles.inputWrapper, !isEstablishmentTypeValid && styles.inputError]}>
          <Picker
            selectedValue={establishmentType}
            onValueChange={(value) => setEstablishmentType(value as EstablishmentType | '')}
            style={styles.picker}
          >
            <Picker.Item label="Sélectionner un type..." value="" />
            {establishmentOptions.map(opt => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
        {!isEstablishmentTypeValid && <Text style={styles.errorText}>Le type d'établissement est obligatoire.</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fonction professionnelle</Text>
        <View style={[styles.inputWrapper, !isProfessionalTypeValid && styles.inputError]}>
          <Picker
            selectedValue={professionalType}
            onValueChange={(value) => setProfessionalType(value as ProfessionalType | '')}
            style={styles.picker}
          >
            <Picker.Item label="Sélectionner une fonction..." value="" />
            {professionalOptions.map(opt => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
        {!isProfessionalTypeValid && <Text style={styles.errorText}>La fonction professionnelle est obligatoire.</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Numéro professionnel</Text>
        <View style={[styles.inputWrapper, !isLicenseNumberValid && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="Numéro de licence (optionnel)"
            onChangeText={setLicenseNumber}
            value={licenseNumber}
          />
        </View>
        {!isLicenseNumberValid && <Text style={styles.errorText}>Le numéro de licence est invalide.</Text>}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: 16 }}>
        <TouchableOpacity style={styles.button} onPress={registerPro} activeOpacity={0.85}>
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
    marginTop: 46,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
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
  picker: {
    height: 48,
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
    marginBottom: 36,

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