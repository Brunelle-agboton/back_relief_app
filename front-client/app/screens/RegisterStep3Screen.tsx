import React, { useState } from 'react';
import { View, TextInput, Button, Text, Image } from 'react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import api from '../../services/api';

type RootStackParamList = {
  'screens/LoginScreen': undefined;
  'screens/RegisterStep3Screen': {
    email: string;
    password: string;
    userName: string;
    age: string;
    sexe: string;
    poids: string;
    taille: string;
  };
}

export default function RegisterStep3Screen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'screens/RegisterStep3Screen'>>();
  const { email, password, userName, age, sexe, poids, taille } = route.params;

  const [hourSit, setHourSit] = useState('');
  const [isExercise, setIsExercise] = useState<boolean | null>(null);
  const [numberTraining, setNumberTraining] = useState('');
  const [restReminder, setRestReminder] = useState(false);
  const [drinkReminder, setDrinkReminder] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      await api.post('/user/register', {
        email,
        password,
        userName,
        role: 'user',
        age: parseInt(age, 10),
        sexe,
        poids: parseInt(poids, 10),
        taille: parseInt(taille, 10),
        hourSit: parseInt(hourSit, 10),
        isExercise,
        numberTraining: parseInt(numberTraining, 10),
        restReminder,
        drinkReminder,
      });
      navigation.navigate('screens/LoginScreen');
    } catch (e) {
      setError('Erreur lors de l\'inscription');
    }
  };

  return (
    <View style={styles.container}>
        <Image
        source={require('../../assets/images/BF.png')}
        style={styles.logo}
      />
        <Text style={styles.label}>En moyenne, vous êtes assis :</Text>
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

        <Text style={styles.label}>Activité physique régulière ?</Text>
        <View style={styles.row}>
            <TouchableOpacity
                style={[styles.option, isExercise === true ? styles.selectedOption : null]}
                onPress={() => setIsExercise(true)}
            />
            <Text >Oui</Text>
            <TouchableOpacity
                style={[styles.option, isExercise === false && styles.selectedOption]}
                onPress={() => setIsExercise(false)}
            />
            <Text style={styles.radioText}>Non</Text>
        </View>

        {isExercise && (
        <>
            <Text style={styles.label}>Si oui, combien de fois par semaine ?</Text>
            <View style={styles.row}>
            {[1, 2, 3, 4].map((times) => (
                <TouchableOpacity
                key={times}
                style={[styles.option, parseInt(numberTraining, 10) === times && styles.selectedOption]}
                onPress={() => setNumberTraining(times.toString())}
                >
                <Text style={styles.optionText}>{times === 4 ? 'Plus de 3' : times}</Text>
                </TouchableOpacity>
            ))}
            </View>
        </>
        )}

        <Text style={styles.label}>Souhaitez-vous activer les rappels :</Text>
          <View style={styles.row}>
            <Text style={styles.optionText}>Rappel de pause :</Text>
            <View style={styles.radioGroup}>
            <View style={styles.radioOption}>
              <TouchableOpacity
              style={[styles.option, restReminder === true && styles.selectedRadioButton]}
              onPress={() => setRestReminder(true)}
              />
                <Text style={styles.radioText}>Oui</Text>
            <TouchableOpacity
              style={[styles.option, restReminder === false && styles.selectedRadioButton]}
              onPress={() => setRestReminder(false)}
            />
              <Text style={styles.radioText}>Non</Text>
          </View>
          </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.optionText}>Rappel d'hydratation :</Text>
            <View style={styles.radioGroup}>
            <View style={styles.radioOption}>

              <TouchableOpacity
                style={[styles.option, drinkReminder === true && styles.selectedRadioButton]}
                onPress={() => setDrinkReminder(true)}
              />
                <Text style={styles.radioText}>Oui</Text>
              <TouchableOpacity
                style={[styles.option, drinkReminder === false && styles.selectedRadioButton]}
                onPress={() => setDrinkReminder(false)}
              />
                <Text style={styles.radioText}>Non</Text>
              </View>
            </View>
          </View>  
            <Button title="Valider" onPress={handleRegister} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    label: {
      fontSize: 16,
      marginVertical: 10,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: 10,
    },
    option: {
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
    },
    selectedOption: {
      backgroundColor: '#007BFF',
      borderColor: '#007BFF',
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
    radioButton: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginHorizontal: 5,
    },
    selectedRadioButton: {
      backgroundColor: '#007BFF',
      borderColor: '#007BFF',
    },
    radioText: {
      marginLeft: 5,
      marginRight: 8,
    },
    error: {
      color: 'red',
      marginTop: 10,
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