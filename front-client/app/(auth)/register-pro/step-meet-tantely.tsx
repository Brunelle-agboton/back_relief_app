import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Pressable, Dimensions, TouchableOpacity, Text, StyleSheet, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CalendarList } from "react-native-calendars";
import { formatDate } from '@/utils/availabilities';
import api from '@/services/api';
import BackButton from '@/components/BackButton';

// Helper to group availabilities by date
const groupAvailabilitiesByDate = (availabilities: any[]) => {
  if (!availabilities) return {};
  return availabilities.reduce((acc: Record<string, any[]>, availability: any) => {
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

const getSafeTimezone = (tz: string | null | undefined): string => {
  if (tz === 'Canada/Québec') {
    return 'America/Montreal';
  }
  return tz || 'UTC'; // Fallback to UTC if timezone is missing
};

const HourChip = React.memo(({ time, selectedTime, onSelect }) => {
  const isSelected = selectedTime?.id === time.id;
  const handlePress = useCallback(() => onSelect(time), [onSelect, time]);

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.hourChip, isSelected && styles.hourChipSelected]}
    >
      <Text style={[styles.hourText, isSelected && styles.hourTextSelected]}>
        {new Date(time.startTime).toLocaleTimeString('ca-CA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: getSafeTimezone(time.timezone) })}
      </Text>
    </Pressable>
  );
});

export default function RegisterProStepMeet() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(formatDate());
  const [selectedTime, setSelectedTime] = useState<any | null>(null); // Changed to store the whole slot object
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const response = await api.get(`/practitioner-profile/by-email/userTest2@gmail.com`);
        setAvailabilities(response.data.availabilities);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch availabilities.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailabilities();
  }, []);

  const groupedAvailabilities = useMemo(() => groupAvailabilitiesByDate(availabilities), [availabilities]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    Object.keys(groupedAvailabilities).forEach(date => {
      marks[date] = {
        marked: true,
        dotColor: '#1662A9',
      };
    });
    if (selectedDate) {
      marks[selectedDate] = { ...(marks[selectedDate] || {}), selected: true, selectedColor: '#D9FBEA', selectedTextColor: '#03694B' };
    }
    return marks;
  }, [groupedAvailabilities, selectedDate]);

  const handleRegister = async () => {
    if (!selectedTime) {
      setError('Veuillez sélectionner un créneau horaire.');
      return;
    }

    const payload = {
      ...params,
      appointment: {
        practitionerId: 1,
        startTime: selectedTime.startTime, // Send the full ISO string
      },
    };

    try {
      await api.post('/auth/register-practitioner', payload);
      router.replace('/(auth)/login');
    } catch (e: any) {
      console.error("Caught Error:", JSON.stringify(e.response?.data, null, 2));
      const message = e.response?.data?.message || e.message;
      const errorMessage = Array.isArray(message) ? message.join(', ') : message;
      setError('Erreur lors de l\'inscription: ' + errorMessage);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1662A9" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
         <BackButton />
      <Text style={styles.title}>Choisissez votre créneau</Text>
      <Text style={styles.description}>Afin de confirmer votre profil, merci de prendre rendez-vous pour un court entretien en visioconférence.</Text>

      <View style={styles.calendarWrap}>
        <CalendarList
          horizontal
          pagingEnabled
          calendarWidth={Dimensions.get("window").width - 32}
          pastScrollRange={0}
          futureScrollRange={12}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setSelectedTime(null);
          }}
          markedDates={markedDates}
          theme={{
            backgroundColor: "#EBF2F3",
            calendarBackground: "#EBF2F3",
            textSectionTitleColor: "#222",
            selectedDayBackgroundColor: "#1662A9",
            selectedDayTextColor: "#fff",
            todayTextColor: "#03694B",
            dayTextColor: "#333",
            textDisabledColor: "#cfcfcf",
            dotColor: "#00adf5",
            arrowColor: "#9AA2A9",
            monthTextColor: "#4A5568",
            textDayFontSize: 12,
            textMonthFontSize: 14,
            textDayHeaderFontSize: 12,
          }}
          style={{ borderRadius: 12 }}
          hideArrows={false}
          showScrollIndicator={false}
        />
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Créneau pour le {selectedDate}</Text>

      <View style={styles.hoursWrap}>
        <Text style={styles.subSectionTitle}>Horaires</Text>
        <FlatList
          data={groupedAvailabilities[selectedDate] || []}
          renderItem={({ item }) => (
            <HourChip
              time={item}
              selectedTime={selectedTime}
              onSelect={setSelectedTime}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          ListEmptyComponent={<Text>Aucun créneau disponible pour cette date.</Text>}
        />
      </View>
          <View>
        <TouchableOpacity
          style={[styles.confirmBtn, !selectedTime && styles.confirmBtnDisabled]}
          onPress={handleRegister}
          disabled={!selectedTime}
        >
          <Text style={styles.confirmText}>Confirmer le rendez-vous</Text>
        </TouchableOpacity>

          </View>
       
    {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 46,

  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',

    marginBottom: 1,
    color: '#333',
  },
  description: {
    textAlign: 'left',
    padding: 10,
    fontSize: 12,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 56,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F1724",
    marginBottom: 8,
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
  hoursWrap: {
    backgroundColor: "#EBF2F3",
    borderRadius: 24,
    padding: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  subSectionTitle: { 
    fontSize: 13, 
    fontWeight: "600", 
    color: "#374151", 
    marginBottom: 8 
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hourChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  hourChipSelected: {
    backgroundColor: "#DFF3E6",
    borderWidth: 1,
    borderColor: "#07A06B",
  },
  hourText: { 
    color: "#374151" 
  },
  hourTextSelected: { 
    color: "#03694B" 
  },
  confirmBtn: {
    marginTop: 18,
    backgroundColor: "#1662A9",
    borderRadius: 15,
    paddingVertical: 14,
    marginBottom: 68,
    alignItems: "center",
  },
  confirmBtnDisabled: {
    marginTop: 18,
    opacity: 0.1,
  },
  confirmText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 16 
  },
});