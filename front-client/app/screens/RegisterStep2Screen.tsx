import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';

type RootStackParamList = {
  'screens/RegisterStep3Screen': { userName: string; email: string; password: string; age: string; sexe: string; poids: string; taille: string };
  'screens/RegisterStep2Screen': { userName: string; email: string; password: string };
};

export default function RegisterStep2Screen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'screens/RegisterStep2Screen'>>();
  const { userName, email, password } = route.params;
  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState('');
  const [taille, setTaille] = useState('');
  const [poids, setPoids] = useState('');

  const handleNext = () => {
    navigation.navigate('screens/RegisterStep3Screen', { email, password, userName, age, sexe, poids, taille });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/icon.png')}
        style={styles.logo}
        testID="logo-image"
      />
    <Text style={styles.description}>
      Personnalisez votre expérience pour des recommandations ciblées, un suivi intelligent de vos douleurs, et des pauses actives sur mesure
    </Text>

    <View style={styles.row}>
      <TouchableOpacity
        testID="radio-homme"
        style={[styles.radioButton, sexe === 'Homme' && styles.selectedRadioButton]}
        onPress={() => setSexe('Homme')}
      />
        <Text style={styles.radioText}>Homme</Text>
      <TouchableOpacity
        testID="radio-femme"
        style={[styles.radioButton, sexe === 'Femme' && styles.selectedRadioButton]}
        onPress={() => setSexe('Femme')}
      />
        <Text style={styles.radioText}>Femme</Text>

      <TouchableOpacity
        testID="radio-nonbinaire"
        style={[styles.radioButton, sexe === 'Non-binaire' && styles.selectedRadioButton]}
        onPress={() => setSexe('Non-binaire')}
      />
        <Text style={styles.radioText}>Non-binaire</Text>
    </View>

    <View style={styles.rrow}>
      <Text  style={styles.label}>Âge</Text>
      <TextInput
        style={[styles.input,styles.smallInput]}
        placeholder="Âge"
        keyboardType="numeric"
        onChangeText={setAge}
        value={age}
      />
      <Text style={styles.unit}>ans</Text>

    </View>

    <View style={styles.rrow}>
      <Text style={styles.label}>Taille</Text>
      <TextInput
        style={[styles.input,styles.smallInput]}
        placeholder="Taille"
        keyboardType="numeric"
        onChangeText={setTaille}
        value={taille}
      />
      <Text style={styles.unit}>m</Text>
    </View>

    <View style={styles.rrow}>
      <Text style={styles.label}>Poids</Text>
      <TextInput
        style={[styles.input, styles.smallInput]}
        placeholder="Poids"
        keyboardType="numeric"
        onChangeText={setPoids}
        value={poids}
      />
      <Text style={styles.unit}>kg</Text>
    </View>
    
    <View style={styles.buttonRow}>
      <TouchableOpacity style={[styles.button, styles.backButton]}>
        <Text style={styles.buttonText}  onPress={handleBack}>Precedent</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.nextButton]}>
        <Text style={styles.buttonText} onPress={handleNext}>Suivant</Text>
      </TouchableOpacity>
    </View>
  </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop:10,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  description: {
    textAlign: 'center',
    color: '#FF8C00',
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioButton: {
    width: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginRight: 4,
  },
  selectedRadioButton: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  radioText: {
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 28,
    padding: 10,
    marginBottom: 8,
    width: '100%',
  },
  smallInput: {
    width: '40%',
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginRight: 8,
    width: 80
  },
  unit: {
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
  },
  logo: {
  width: 90,
  height: 90,
  resizeMode: 'contain',
  alignSelf: 'center',
  marginBottom: 8,
  marginTop: 16,
},
  buttonRow: { flexDirection: 'row', marginTop: 32 },
  button: { flex: 1, marginHorizontal: 10, padding: 16, borderRadius: 28, alignItems: 'center'},
  nextButton:{
    backgroundColor: '#ED6A5E'
  },
  backButton:{
    backgroundColor: '#FFAE00'
  },
    buttonText: { color: '#ffff', fontWeight: 'bold', fontSize: 18 },

});