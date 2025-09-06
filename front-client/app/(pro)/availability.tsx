import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Optional: Configure calendar for French language
LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  // today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

type TimeSlot = {
  startTime: string;
  endTime: string;
};

export default function AvailabilityScreen() {
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availabilities, setAvailabilities] = useState<{ [key: string]: TimeSlot[] }>({});
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const onDayPress = (day: any) => {
    setSelectedDay(day.dateString);
  };

  const addAvailability = () => {
    if (startTime && endTime) {
      const newSlot = { startTime, endTime };
      const updatedSlots = [...(availabilities[selectedDay] || []), newSlot];
      setAvailabilities({ ...availabilities, [selectedDay]: updatedSlots });
      setStartTime('');
      setEndTime('');
    }
  };

  const removeAvailability = (index: number) => {
    const updatedSlots = availabilities[selectedDay].filter((_, i) => i !== index);
    setAvailabilities({ ...availabilities, [selectedDay]: updatedSlots });
  };
  
  const handleSave = () => {
    // TODO: Call the API to save the `availabilities` object
    console.log('Saving availabilities:', JSON.stringify(availabilities, null, 2));
    alert('Disponibilités enregistrées !');
  };

  return (
    <ThemedView style={styles.container} lightColor='#f0f0f0'>
      <ScrollView>
        <ThemedText type="title">Gérer mes disponibilités</ThemedText>
        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            ...Object.keys(availabilities).reduce((acc: Record<string, any>, date) => {
              acc[date] = { marked: true, dotColor: '#50cebb' };
              return acc;
            }, {}),
            [selectedDay]: { selected: true, selectedColor: '#2c9d8f' }
          }}
          theme={{
            todayTextColor: '#2c9d8f',
            arrowColor: '#2c9d8f',
          }}
        />
        <View style={styles.dayDetails}>
          <ThemedText type="subtitle">Disponibilités pour le {selectedDay}</ThemedText>
          
          {availabilities[selectedDay]?.length > 0 ? (
            availabilities[selectedDay].map((slot, index) => (
              <View key={index} style={styles.slot}>
                <Text style={styles.slotText}>{slot.startTime} - {slot.endTime}</Text>
                <TouchableOpacity onPress={() => removeAvailability(index)} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noSlotText}>Aucun créneau pour cette date.</Text>
          )}

          <View style={styles.addSlotContainer}>
            <ThemedText type="defaultSemiBold">Ajouter un créneau</ThemedText>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Heure de début (HH:MM)"
                value={startTime}
                onChangeText={setStartTime}
              />
              <TextInput
                style={styles.input}
                placeholder="Heure de fin (HH:MM)"
                value={endTime}
                onChangeText={setEndTime}
              />
            </View>
            <Button title="Ajouter le créneau" onPress={addAvailability} color="#2c9d8f" />
          </View>
        </View>
      </ScrollView>
      <View style={styles.saveButtonContainer}>
        <Button title="Enregistrer les modifications" onPress={handleSave} color="#007BFF" />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  dayDetails: {
    padding: 15,
    marginTop: 10,
  },
  addSlotContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '48%',
    backgroundColor: 'white',
  },
  slot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e0f2f1',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  slotText: {
    color: '#00796b',
  },
  noSlotText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
  },
  removeButton: {
    backgroundColor: '#ffcdd2',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#c62828',
    fontWeight: 'bold',
  },
  saveButtonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  }
});
