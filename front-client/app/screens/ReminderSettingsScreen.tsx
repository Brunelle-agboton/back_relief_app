import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import NotificationService, { ReminderSettings } from '../../services/NotificationService';
import { router, useLocalSearchParams, useRouter } from 'expo-router';import Ionicons from '@expo/vector-icons/Ionicons';

import { getUserId } from '../../context/AuthContext';
import api from '../../services/api';

export default function ReminderSettingsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [interval, setInterval] = useState(1);
  const [type, setType] = useState<'pause'|'water'>('pause');
    const [restReminder, setRestReminder] = useState(false);
    const [drinkReminder, setDrinkReminder] = useState(false);
    const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const userId = await getUserId(); // Récupérez l'ID de l'utilisateur
                     if (!userId) {
                       router.replace('/screens/LoginScreen');
                       return;
                     }
           const id = parseInt(userId, 10);
            const { data } = await api.get(`user/me/${id}`);
                  setRestReminder(data.restReminder);
            setDrinkReminder(data.drinkReminder);

      const saved = await NotificationService.loadSettings();
      if (saved) {
        setEnabled(saved.enabled);
        setInterval(saved.intervalHours);
        setType(saved.type);
      }
    })();
  }, []);

  const save = async () => {
   const settings: ReminderSettings = { enabled, intervalHours: interval, type };
   try {
     await NotificationService.saveSettings(settings);
     Alert.alert(
       "Succès",
       "Paramètres enregistrés !",
       [{ text: "OK" }],
       { cancelable: false }
     );
    router.push('/(tabs)/pauseActive');

   } catch (err) {
     console.error(err);
     Alert.alert(
       "Erreur",
       "La sauvegarde a échoué, réessaie plus tard.",
       [{ text: "OK" }],
       { cancelable: false }
     );
   }
};

  return (
    <View style={styles.container}>
        <View style={styles.titleContainer}>
              <TouchableOpacity onPress={() => router.back()} >
                <Ionicons name="chevron-back" size={34} color="black" />
      
              </TouchableOpacity>
              <Text style={styles.title}>Modifier mes informations</Text>
      
            </View>
      
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
      {/* <View style={styles.row}>
        <Text>Activer rappels</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View> */}
      <View style={styles.row}>
        <Text  style={{ width: 150, fontSize: 18, }}>Intervalle (heures)</Text>
        <Picker
          selectedValue={interval}
          style={{ width: 100 }}
          onValueChange={(v) => setInterval(v)}
        >
          <Picker.Item label="1h" value={1} />
          <Picker.Item label="2h" value={2} />
          <Picker.Item label="3h" value={3} />
        </Picker>
      </View>
      <View style={styles.row}>
        <Text  style={{ width: 150, fontSize: 18, }}>Type de rappel</Text>
        <Picker
          selectedValue={type}
          style={{ width: 150, fontSize: 18, }}
          onValueChange={(v) => setType(v as 'pause'|'water')}
        >
          <Picker.Item label="Pause Active" value="pause" />
          <Picker.Item label="Boire de l’eau" value="water" />
        </Picker>
      </View>
       <TouchableOpacity style={styles.buttonSave}>
              <Text style={styles.buttonText} onPress={save}>Enregistrer</Text>
            </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
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
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
    label: {
      fontSize: 18,
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
      fontSize: 18,

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

});
