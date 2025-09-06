import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';

// Configure calendar for French language (same as before)
LocaleConfig.locales['fr'] = {
  monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  // firstDay: 1,
};
LocaleConfig.defaultLocale = 'fr';

type TimeSlot = {
  startTime: string;
  endTime: string;
};

// DUMMY DATA - a real implementation would fetch this from the backend API
const DUMMY_AVAILABILITIES: { [key: string]: TimeSlot[] } = {
  [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: [
    { startTime: '09:00', endTime: '09:30' },
    { startTime: '10:00', endTime: '10:30' },
    { startTime: '14:00', endTime: '14:30' },
  ],
  [new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]]: [
    { startTime: '11:00', endTime: '11:30' },
  ],
};


export default function BookAppointmentScreen() {
  const router = useRouter();
  const { proId, proName } = useLocalSearchParams<{ proId: string; proName: string }>();
  
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

  useEffect(() => {
    // Mark dates that have availabilities
    const marked = Object.keys(DUMMY_AVAILABILITIES).reduce((acc: Record<string, any>, date) => {
      acc[date] = { marked: true, dotColor: '#50cebb' };
      return acc;
    }, {});
    setMarkedDates(marked);
  }, []);

  useEffect(() => {
    // Fetch slots for the selected day
    // TODO: Replace with actual API call: GET /practitioners/{proId}/availabilities?date={selectedDay}
    const slots = DUMMY_AVAILABILITIES[selectedDay] || [];
    setAvailableSlots(slots);
  }, [selectedDay]);

  const onDayPress = (day: any) => {
    setSelectedDay(day.dateString);
  };

  const handleSlotPress = (slot: TimeSlot) => {
    Alert.alert(
      'Confirmer le rendez-vous',
      `Voulez-vous vraiment réserver le créneau de ${slot.startTime} à ${slot.endTime} le ${selectedDay} avec ${proName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => {
            // TODO: Call API to book: POST /appointments
            console.log('Booking confirmed for:', { proId, selectedDay, ...slot });
            router.push({
              pathname: '/teleconsultation/booking-confirmation',
              params: { proName, date: selectedDay, time: slot.startTime }
            });
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container} >
      <ScrollView>
        <Text style={styles.title}>Prendre rendez-vous</Text>
        <Text style={styles.subtitle}>avec {proName}</Text>
        
        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            ...markedDates,
            [selectedDay]: { ...markedDates[selectedDay], selected: true, selectedColor: '#2c9d8f' }
          }}
          theme={{
            todayTextColor: '#2c9d8f',
            arrowColor: '#2c9d8f',
          }}
        />

        <View style={styles.slotsContainer}>
          <Text style={styles.subtitle}>Créneaux disponibles pour le {selectedDay}</Text>
          {availableSlots.length > 0 ? (
            <View style={styles.slotsGrid}>
              {availableSlots.map((slot, index) => (
                <TouchableOpacity key={index} style={styles.slotButton} onPress={() => handleSlotPress(slot)}>
                  <Text style={styles.slotText}>{slot.startTime}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noSlotsText}>Aucun créneau disponible pour cette date.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
     backgroundColor: '#fff',
  },
  slotsContainer: {
    padding: 15,
    marginTop: 10,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  slotButton: {
    backgroundColor: '#e0f2f1',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: '#50cebb'
  },
  slotText: {
    color: '#00796b',
    fontWeight: 'bold',
  },
  noSlotsText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
    title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
