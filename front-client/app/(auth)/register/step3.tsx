import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, Image } from 'react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import api from '@/services/api';
import { useRouter, useLocalSearchParams } from 'expo-router';

type RootStackParamList = {
  '/(auth)/login': undefined;
  '/(auth)/register/step3': {
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
    const router = useRouter();
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, '/(auth)/register/step3'>>();
  const { email, password, userName, age, sexe, poids, taille } = useLocalSearchParams();

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
      router.push('/login');
      
    } catch (e) {
      setError('Erreur lors de l\'inscription');
    }
  };
  
  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
        <Image
        source={require('@/assets/images/icon.png')}
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
            <Text style={styles.label}>Si oui, combien de fois par semaine ?</Text>
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

        <Text style={styles.label}>Souhaitez-vous activer les rappels :</Text>
          <View style={styles.row}>
            <Text style={styles.optionText}>Rappel de pause :</Text>
            <View style={styles.radioGroup}>
            <View style={styles.radioOption}>
              <TouchableOpacity
              testID='reset-yes'
              style={[styles.option, restReminder === true && styles.selectedRadioButton]}
              onPress={() => setRestReminder(true)}
              />
                <Text style={styles.radioText}>Oui</Text>
            <TouchableOpacity
              testID='reset-no'
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
                testID='drink-yes'
                style={[styles.option, drinkReminder === true && styles.selectedRadioButton]}
                onPress={() => setDrinkReminder(true)}
              />
                <Text style={styles.radioText}>Oui</Text>
              <TouchableOpacity
                testID='drink-no'
                style={[styles.option, drinkReminder === false && styles.selectedRadioButton]}
                onPress={() => setDrinkReminder(false)}
              />
                <Text style={styles.radioText}>Non</Text>
              </View>
            </View>
          </View>  
        
     <View style={styles.rowRight}>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.button,
                styles.buttonSmall,
                pressed && styles.pressed,
                { marginRight: 18 } // espace entre les deux boutons
              ]}
              accessibilityLabel="Précédent"
            >
              <Text style={styles.buttonText}>Précédent</Text>
            </Pressable>
    
            <Pressable
              onPress={handleRegister}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed
              ]}
              accessibilityLabel="Suivant"
            >
              <Text style={styles.buttonText}>Suivant</Text>
            </Pressable>
          </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      marginTop:60,

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
    radioButton: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginHorizontal: 5,
    },
    selectedRadioButton: {
      backgroundColor: '#CDFBE2',
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
  
 rowRight: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmall: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    shadowOpacity: 0.04,
    elevation: 3,
  },
  buttonText: {
    color: '#6b6b6b',
    fontSize: 15,
    fontWeight: '500',
  },
});