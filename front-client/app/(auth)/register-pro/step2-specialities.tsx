import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { specialites } from '@/utils/specialities';

export default function RegisterProStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // const [city, setCity] = useState('');
  const [diplome, setDiplome] = useState('');
  const [school, setSchool] = useState('');
  const [country, setCountry] = useState('');
  const [yearExperience, setYearExperience] = useState('');
  const [error, setError] = useState('');
  // State pour stocker les noms des spécialités sélectionnées
  const [proSpecialities, setProSpecialities] = useState<string[]>([]);

  // Fonction pour gérer la sélection/désélection d'une spécialité
  const handleSelectSpecialty = (specialtyName: string) => {
    // Vérifier si la spécialité est déjà sélectionnée
    if (proSpecialities.includes(specialtyName)) {
      // Si oui, la retirer de la liste
      setProSpecialities(proSpecialities.filter(s => s !== specialtyName));
    } else {
      // Si non, l'ajouter à la liste
      setProSpecialities([...proSpecialities, specialtyName]);
    }
  };

  const handleNext = () => {
    if (proSpecialities.length === 0) {
      setError('Vous devez sélectionner au moins une spécialité.');
      return;
    }
    setError('');
    const diplomes = [{diplome, school, country, yearExperience}]
    router.push({
      pathname: '/register-pro/step3-availabilities',
      params: { 
        ...params, // Passer tous les anciens paramètres
        diplomes: JSON.stringify(diplomes),
        proSpecialities: JSON.stringify(proSpecialities) // Passer les spécialités en JSON
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, {marginTop: 66}]}>Vos expériences</Text> 
        <View style={styles.inputContainer}>
              <Text style={styles.label}>Diplôme</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Diplôme "
                  onChangeText={setDiplome}
                  value={diplome}
                />
              </View>
            </View>
      
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ecole</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Ecole"
                  onChangeText={setSchool}
                  value={school}
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
             
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Années {'\n'}d’expérience</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Années d’expérience"
                  onChangeText={setYearExperience}
                  value={yearExperience}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
      <Text style={[styles.title, {marginTop: 30}]}>Vos spécialités</Text>
      
      <View style={styles.specialityContainerButton}>
        {specialites.map((s) => {
          const isSelected = proSpecialities.includes(s.name);
          return (
            <TouchableOpacity 
              key={s.id} // Toujours utiliser une clé unique pour les éléments de la liste
              style={[styles.specialityBtn, isSelected && styles.specialityBtnSelected]}
              onPress={() => handleSelectSpecialty(s.name)}
            >
              <Text style={[styles.specialityBtnText, isSelected && styles.specialityBtnTextSelected]}>
                {s.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: 16, marginTop: 20 }}>
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
    padding: 10,
    backgroundColor: '#fff',
  },
 
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 19,
    color: '#333',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginRight: 10,
    width: 100, // Fixed width for labels
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden', // Empêche le débordement du fond
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    padding: 10,
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
    marginTop: 16,
    textAlign: 'center',
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
  specialityContainerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  specialityBtn: {
    margin: 9,
    borderColor: '#1662A9',
    borderWidth: 1,
    borderRadius: 19,
    paddingHorizontal: 10,
    paddingVertical:6,

    backgroundColor: '#fff',
  },
  specialityBtnSelected: {
    backgroundColor: '#CDFBE2',
    borderColor: '#CDFBE2',
  },
  specialityBtnText: {
    fontSize: 14,
    color: '#000',
  },
  specialityBtnTextSelected: {
    color: '#000',
  },
});