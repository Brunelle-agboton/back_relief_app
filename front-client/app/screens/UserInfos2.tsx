import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { getUserId } from '../../context/AuthContext';
import api from '../../services/api';
import { NumberSpinner } from '../../components/NumberSpinner';

const GENDER_OPTIONS = ['Homme','Femme','Non-binaire'];
const SIT_HOURS      = [ '8','9','10','12','14' ];
const TRAINING_FREQ  = ['1','2','3','Plus de 3'];
export default function UserInfos2() {
  const router = useRouter();
  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState('');
  const [taille, setTaille] = useState('');
  const [poids, setPoids] = useState('');
  const [hourSit, setHourSit] = useState('');
  const [isExercise, setIsExercise] = useState<boolean | null>(null);
  const [numberTraining, setNumberTraining] = useState('');
    const [freq, setFreq]             = useState<string>('');

  const [error, setError] = useState('');

   useEffect(() => {
    (async () => {
     const userId = await getUserId(); // Récupérez l'ID de l'utilisateur
               if (!userId) {
                 router.replace('/screens/LoginScreen');
                 return;
               }
     const id = parseInt(userId, 10);
      const { data } = await api.get(`user/me/${id}`);
      setSexe(data.sexe);
      setAge(String(data.age));
      setTaille(String(data.taille));
      setPoids(String(data.poids));
      setHourSit(String(data.hourSit));
      setIsExercise(data.isExercise);
      setFreq(String(data.numberTraining));
    })();
  }, []);

  const handleSubmit = async () => {
    if (!age || !sexe || !taille || !poids || !hourSit || (isExercise && !freq)) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setError('');
     await api.put('/user/me', {
      sexe,
      age: Number(age),
      taille: Number(taille),
      poids: Number(poids),
      hourSit: Number(hourSit),
      isExercise,
      numberTraining: isExercise ? Number(freq) : 0,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => router.back()} >
          <Ionicons name="chevron-back" size={34} color="black" />

        </TouchableOpacity>
        <Text style={styles.title}>Modifier mes informations</Text>

      </View>

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
        <Text style={styles.label}>Âge</Text>
        <NumberSpinner
        
    value={parseInt(age,10)||0}
    min={0}
    max={120}
    step={1}
    onChange={v => setAge(String(v))}
  />
        <Text style={styles.unit}>ans</Text>

      </View>

      <View style={styles.rrow}>
        <Text style={styles.label}>Taille</Text>
         <NumberSpinner
        
    value={parseInt(taille,10)||0}
    min={0}
    max={200}
    step={1}
    onChange={v => setTaille(String(v))}
  />
        <Text style={styles.unit}>m</Text>
      </View>

      <View style={styles.rrow}>
        <Text style={styles.label}>Poids</Text>
          <NumberSpinner
        
    value={parseInt(poids,10)||0}
    min={0}
    max={200}
    step={1}
    onChange={v => setPoids(String(v))}
  />
        <Text style={styles.unit}>kg</Text>
      </View>
      <Text style={styles.input}>En moyenne, vous êtes assis :</Text>
      <View style={styles.row}>
        {[8, 9, 10, 12, 14].map((hours) => (
          <TouchableOpacity
            key={hours}
            style={[styles.option, parseInt(hourSit, 10) === hours && styles.selectedOption]}
            onPress={() => setHourSit(hours.toString())}
          >
            <Text style={styles.optionText}>{hours === 14 ? 'Plus de 12' : hours}</Text>
          </TouchableOpacity>
        ))}

      </View>

      <Text style={styles.input}>Activité physique régulière ?</Text>
      <View style={styles.row}>
        <TouchableOpacity
          testID="exercise-yes"
          style={[styles.option, isExercise === true ? styles.selectedOption : null]}
          onPress={() => setIsExercise(true)}
        />
        <Text >Oui</Text>
        <TouchableOpacity
          testID="exercise-no"
          style={[styles.option, isExercise === false && styles.selectedOption]}
          onPress={() => setIsExercise(false)}
        />
        <Text style={styles.radioText}>Non</Text>
      </View>

      {isExercise && (
        <>
          <Text style={styles.input}>Si oui, combien de fois par semaine ?</Text>
          <View style={styles.row}>
            {[1, 2, 3, 4].map((times) => (
              <TouchableOpacity
                key={times}
                testID={`training-${times}`}
                style={[styles.option, parseInt(numberTraining, 10) === times && styles.selectedOption]}
                onPress={() => setNumberTraining(times.toString())}
              >
                <Text style={styles.optionText}>{times === 4 ? 'Plus de 3' : times}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.buttonSave}>
        <Text style={styles.buttonText} onPress={handleSubmit}>Enregistrer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 20,
    color: '#333',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
    backgroundColor: '#CDFBE2',
  },
  radioText: {
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  input: {
    flexDirection: 'row',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  smallInput: {
    width: '40%',
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginVertical: 4,
    marginRight: 8,
    width: 100
  },
  unit: {
    fontSize: 16,
    color: '#000',
    marginLeft: 15,
  },
  buttonSave: {
    margin: 60,
    paddingHorizontal: 0,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: '#CDFBE2'
  },
  buttonText: { color: '#000', fontSize: 18 },

  buttonRow: { flexDirection: 'row', marginTop: 32 },
  button: { flex: 1, marginHorizontal: 10, padding: 16, borderRadius: 28, alignItems: 'center' },
  option: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  selectedOption: {
    backgroundColor: '#CDFBE2',
  },
  optionText: {
    color: '#000',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioOption: {
    flexDirection: 'row', // Aligne le bouton radio et le texte horizontalement
    alignItems: 'stretch', // Aligne le texte au centre verticalement
    marginHorizontal: 0, // Espace entre les options "Oui" et "Non"
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});