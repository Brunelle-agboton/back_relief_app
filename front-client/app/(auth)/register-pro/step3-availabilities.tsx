import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar } from "react-native-calendars";
import { LocaleConfig } from 'react-native-calendars';
import { usePractitioner } from '@/context/PractitionerContext';
import api from '@/services/api';

LocaleConfig.locales['fr'] = {
  monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  monthNamesShort: ['Janv.','Févr.','Mars','Avril','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'],
  dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
  dayNamesShort: ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'],
  today: 'Aujourd\'hui'
};
LocaleConfig.defaultLocale = 'fr';

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const morningSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
const afternoonSlots = ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

export default function RegisterProStep3Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { profile, refetchProfile } = usePractitioner();
  const [error, setError] = useState('');

  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, string[]>>({
    'Lundi': [], 'Mardi': [], 'Mercredi': [], 'Jeudi': [], 'Vendredi': [], 'Samedi': [], 'Dimanche': []
  });
  const [selectedDay, setSelectedDay] = useState('Lundi');

  const onDayPress = (day) => {
    if (!dateRange.startDate || dateRange.endDate) {
      setDateRange({ startDate: day.dateString, endDate: null });
    } else {
      const start = new Date(dateRange.startDate);
      const end = new Date(day.dateString);
      if (start > end) {
        setDateRange({ startDate: day.dateString, endDate: dateRange.startDate });
      } else {
        setDateRange({ ...dateRange, endDate: day.dateString });
      }
    }
  };

  const markedDates = useMemo(() => {
    const marked = {};
    if (dateRange.startDate) {
      marked[dateRange.startDate] = { startingDay: true, color: '#1662A9', textColor: 'white' };
      if (dateRange.endDate) {
        let currentDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        while (currentDate <= endDate) {
          const dateString = currentDate.toISOString().split('T')[0];
          if (!marked[dateString]) {
            marked[dateString] = { color: '#D9E8F5', textColor: 'black' };
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        marked[dateRange.endDate] = { endingDay: true, color: '#1662A9', textColor: 'white' };
      }
    }
    return marked;
  }, [dateRange]);

  const toggleTimeSlot = (slot) => {
    setWeeklySchedule(prev => {
      const currentSlots = prev[selectedDay];
      const newSlots = currentSlots.includes(slot)
        ? currentSlots.filter(s => s !== slot)
        : [...currentSlots, slot];
      return { ...prev, [selectedDay]: newSlots.sort() };
    });
  };

  const handleProfile = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      Alert.alert("Erreur", "Veuillez sélectionner une période de début et de fin.");
      return;
    }

    const generatedAvailabilities = {};
    let currentDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    while (currentDate <= endDate) {
      const dayOfWeek = daysOfWeek[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1];
      const slots = weeklySchedule[dayOfWeek];
      
      if (slots.length > 0) {
        const dateString = currentDate.toISOString().split('T')[0];
        generatedAvailabilities[dateString] = slots;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const payload = { ...params, availabilities: generatedAvailabilities };
    try {
        const res = await api.patch(`/practitioner-profile/complete-profile/${profile?.id}`, payload);
        await refetchProfile();
        router.replace('/(pro)');
    } catch (e) {
        setError('Erreur: ' + e.message);
        console.error('Erreur', e);
    }
  };

  const renderHourChip = (time: string) => {
    const isSelected = weeklySchedule[selectedDay].includes(time);
    return (
      <TouchableOpacity
        key={time}
        style={[styles.hourChip, isSelected && styles.hourChipSelected]}
        onPress={() => toggleTimeSlot(time)}
      >
        <Text style={[styles.hourText, isSelected && styles.hourTextSelected]}>{time}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Vos disponibilités</Text>

      <Text style={styles.sectionTitle}>1. Choisissez une période</Text>
              <View style={styles.calendarWrap}>
      
      <Calendar
        onDayPress={onDayPress}
        markingType={'period'}
        markedDates={markedDates}
        theme={{
                backgroundColor: "#EBF2F3",
               calendarBackground: "#EBF2F3",
            arrowColor: '#1662A9',
            monthTextColor: '#1662A9',
        }}
      />
</View>
      <Text style={styles.sectionTitle}>2. Définissez vos horaires hebdomadaires</Text>
      <View style={styles.hoursWrap}>

      <View style={styles.weekDaysRow}>
        {daysOfWeek.map(day => (
          <TouchableOpacity
            key={day}
            style={[styles.dayCell, selectedDay === day && styles.dayCellSelected]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayShort, selectedDay === day && styles.dayShortSelected]}>{day.substring(0, 3)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      </View>

      <View style={styles.hoursWrap}>
        <Text style={styles.subSectionTitle}>Matin</Text>
        <View style={styles.chipsRow}>
          {morningSlots.map(renderHourChip)}
        </View>
      </View>

       <View style={styles.hoursWrap}>
        <Text style={styles.subSectionTitle}>Après-midi</Text>
        <View style={styles.chipsRow}>
          {afternoonSlots.map(renderHourChip)}
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleProfile}>
        <Text style={styles.buttonText}>Confirmer le profil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
  },
  calendarWrap: {
    backgroundColor: "#EBF2F3",
    borderRadius: 24,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  dayCell: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    width: 45,
  },
  dayCellSelected: {
    backgroundColor: '#1662A9',
  },
  dayShort: {
    fontSize: 14,
    color: 'black',
  },
  dayShortSelected: {
    color: 'white',
  },
  hoursWrap: {
    backgroundColor: "#EBF2F3",
    textAlign: 'center',
    borderRadius: 24,
    padding: 12,
    marginTop: 10,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hourChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  hourChipSelected: {
    backgroundColor: "#DFF3E6",
    borderWidth: 1,
    borderColor: "#07A06B",
  },
  hourText: { color: "#374151" },
  hourTextSelected: { color: "#03694B" },
  button: {
    marginTop: 30,
    padding: 15,
    marginHorizontal:20,
    backgroundColor: '#1662A9',
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  }
});