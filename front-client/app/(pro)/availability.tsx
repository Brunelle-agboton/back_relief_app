import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { usePractitioner } from '@/context/PractitionerContext';
import { Calendar } from 'react-native-calendars';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
import api from '@/services/api';

// Helper to group availabilities by date
const groupAvailabilitiesByDate = (availabilities: any[]) => {
  if (!availabilities) return {};
  return availabilities.reduce((acc: Record<string, any[]>, availability:any) => {
    const date = new Date(availability.startTime).toLocaleDateString('en-CA'); // YYYY-MM-DD format
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(availability);
    // Sort times for each day
    acc[date].sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return acc;
  }, {});
};

const AvailabilityScreen = () => {
  const { profile, isLoading, error, refetchProfile } = usePractitioner();
  const [selectedDay, setSelectedDay] = useState<string>(''); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>(''); // "HH:MM"
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

    const groupedAvailabilities =  useMemo(() => groupAvailabilitiesByDate(profile?.availabilities || []), [profile?.availabilities]);
  const sortedDates = Object.keys(groupedAvailabilities).sort();

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    Object.keys(groupedAvailabilities).forEach(date => {
      marks[date] = {
        marked: true,
        dotColor: '#1662A9',
      };
    });
    if (selectedDay) {
      marks[selectedDay] = { ...(marks[selectedDay] || {}), selected: true, selectedColor: '#2c9d8f' };
    }
    return marks;
  }, [groupedAvailabilities, selectedDay]);

  const handleDayPress = (day: any) => {
    // day.dateString is YYYY-MM-DD
    setSelectedDay(day.dateString);
    setSelectedTime(''); // reset time when date changes
  };

  const showTimePicker = () => setTimePickerVisible(true);
  const hideTimePicker = () => setTimePickerVisible(false);

  const handleConfirmTime = (date: Date) => {
    // date contains a Date object with time selected; we only need HH:mm
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    setSelectedTime(`${hh}:${mm}`);
    hideTimePicker();
  };

  const handleAddNewSlot = async () => {
    if (!selectedDay) {
      Alert.alert('Sélectionnez une date', 'Choisissez d’abord une date dans le calendrier.');
      return;
    }
    if (!selectedTime.match(/^\d{2}:\d{2}$/)) {
      Alert.alert('Sélectionnez une heure', 'Choisissez une heure via le sélecteur.');
      return;
    }

    // Build JS Date from YYYY-MM-DD + HH:MM in local timezone
    const [hh, mm] = selectedTime.split(':').map(Number);
    const constructed = new Date(selectedDay);
    constructed.setHours(hh, mm, 0, 0);

    if (isNaN(constructed.getTime())) {
      Alert.alert('Date invalide', 'La date/heure sélectionnée est invalide.');
      return;
    }

    // Client-side duplicate check
    const exists = (profile?.availabilities || []).some((slot: any) => {
      const slotStart = new Date(slot.startTime).getTime();
      return slotStart === constructed.getTime();
    });
    if (exists) {
      Alert.alert('Créneau existant', 'Un créneau identique existe déjà pour cette date/heure.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const end = new Date(constructed.getTime() + 30 * 60 * 1000);

      // Convert to ISO strings. NOTE: Backend should expect ISO in UTC or with timezone.
      // If profile.timezone exists you may want to compute offsets properly server-side.
      const startISO = constructed.toISOString();
      const endISO = end.toISOString();

      await api.post('/practitioner-profile/me/availability', {
        userId: profile?.id,
        startTime: startISO,
        endTime: endISO,
        timezone: profile?.timezone || 'UTC',
        note: '',
      });

      Alert.alert('Succès', 'Le créneau a été ajouté.');
      setSelectedTime('');
      // re-fetch profile to update the calendar
      await refetchProfile();
    } catch (apiError: any) {
      const errorMessage = apiError.response?.data?.message || 'Échec lors de l\'ajout du créneau.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !profile) { // Show initial loading indicator for profile
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#1662A9" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) { // Error fetching profile
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Manage Your Availability</Text>

       {/* Calendar */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select a date</Text>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              calendarBackground: '#fff',
              todayTextColor: '#2c9d8f',
              arrowColor: '#2c9d8f',
              textSectionTitleColor: '#374151',
            }}
            style={{ borderRadius: 8 }}
            // firstDay={1} // uncomment if you want Monday as first day
          />

          <View style={{ marginTop: 12 }}>
            <Text style={{ marginBottom: 8, color: '#374151' }}>
              Date choisie: {selectedDay || 'Aucune'}
            </Text>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={[styles.button, !selectedDay && styles.buttonDisabled]}
                onPress={showTimePicker}
                disabled={!selectedDay}
              >
                <Text style={styles.buttonText}>{selectedTime ? `Heure: ${selectedTime}` : 'Choisir une heure'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, (!selectedDay || !selectedTime || isSubmitting) && styles.buttonDisabled]}
                onPress={handleAddNewSlot}
                disabled={!selectedDay || !selectedTime || isSubmitting}
              >
                <Text style={styles.buttonText}>{isSubmitting ? 'Ajout...' : 'Add Slot'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Time picker modal */}
        {/* <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleConfirmTime}
          onCancel={hideTimePicker}
          // is24Hour prop can be set if needed (Android)
        /> */}

        {/* Existing availabilities */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Current Schedule</Text>
          {sortedDates.length > 0 ? (
            sortedDates.map(date => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeaderText}>
                  {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
                <View style={styles.timeSlotsContainer}>
                  {groupedAvailabilities[date].map((slot: any) => (
                    <View key={slot.id ?? slot.startTime} style={styles.timeSlot}>
                      <Text style={styles.timeSlotText}>
                        {new Date(slot.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text>You have no availabilities scheduled.</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// Add extensive styling
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  container: { flex: 1, padding: 20 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: '#1a202c' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16, color: '#2d3748' },
  dateGroup: { marginBottom: 16 },
  dateHeaderText: { fontSize: 18, fontWeight: 'bold', color: '#4a5568', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4 },
  timeSlotsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  timeSlot: { backgroundColor: '#e2e8f0', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  timeSlotText: { color: '#2d3748', fontWeight: '500' },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#1662A9',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AvailabilityScreen;
