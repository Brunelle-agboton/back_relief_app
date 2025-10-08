import React, { useMemo, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert, ActivityIndicator
} from "react-native";
import { Stack, useRouter,useLocalSearchParams } from "expo-router";
import { CalendarList } from "react-native-calendars";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Localisation  from '@/assets/images/Consultation/Localisation.svg';
import { formatDate } from '@/utils/availabilities';
import api from '@/services/api';
import { SpecialtyCardProps, User, PractitionerProfile, Availability } from '@/interfaces/types';
import { useAuth } from '@/context/AuthContext';

function formatDateISO(d = new Date()) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

const toLocalYYYYMMDD = (d: Date) => {
  const year = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${m}-${day}`;
};

const getSafeTimezone = (tz: string | null | undefined): string => {
  if (tz === 'Canada/Québec') {
    return 'America/Montreal';
  }
  return tz || 'UTC'; // Fallback to UTC if timezone is missing
};

const timeHHMM = (isoOrDate: string | Date, timeZone: string) => {
  return new Date(isoOrDate).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: getSafeTimezone(timeZone),
  });
};

export default function ProBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id ? Number(params.id) : undefined;
  const { authState } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [PRO, setPRO] = useState<PractitionerProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDate());
  const [selectedTime, setSelectedTime] = useState<Availability | null>(null); // <-- Refactored state
  const [customReason, setCustomReason] = useState<string>('');
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const REASON_MAX = 300;


  useEffect(() => {
    if (!id) {
      Alert.alert('Erreur', 'Praticien introuvable');
      router.back();
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/practitioner-profile/${id}`);
        if (!mounted) return;
        setPRO(res.data);
      } catch (err) {
        console.error(err);
        Alert.alert('Erreur', 'Impossible de charger le profil');
        router.back();
      } finally {
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [id]);

  const groupedAvailabilities = useMemo(() => {
    if (!PRO?.availabilities) return {};
    return PRO.availabilities.reduce<Record<string, Availability[]>>((acc, slot) => {
      const d = new Date(slot.startTime);
      const key = toLocalYYYYMMDD(d);
      acc[key] ||= [];
      acc[key].push(slot);
      return acc;
    }, {});
  }, [PRO?.availabilities]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    Object.keys(groupedAvailabilities).forEach(date => {
      marks[date] = { marked: true, dotColor: '#1662A9' };
    });
    if (selectedDate) {
      marks[selectedDate] = { ...(marks[selectedDate] || {}), selected: true, selectedColor: '#D9FBEA', selectedTextColor: '#03694B' };
    }
    return marks;
  }, [groupedAvailabilities, selectedDate]);

  useEffect(() => {
    if (!PRO) return;
    const allSlots = [...(PRO.availabilities || [])]
      .filter(s => !s.isBooked)
      .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    if (allSlots.length === 0) {
      Alert.alert('Aucune disponibilité', 'Aucune dispo pour ce praticien.');
      setSelectedDate(null);
      setSelectedTime(null);
      return;
    }
    
    const first = allSlots[0];
    const firstDate = toLocalYYYYMMDD(new Date(first.startTime));

    setSelectedDate(prev => prev ?? firstDate);
    setSelectedTime(prev => prev ?? first); // <-- Refactored to store object
  }, [PRO]);

  // Returns full Availability objects for the selected date
  const availableSlotsForSelectedDate: Availability[] = useMemo(() => {
    if (!selectedDate) return [];
    const slots = groupedAvailabilities[selectedDate] || [];
    return slots
      .filter(s => !s.isBooked)
      .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [groupedAvailabilities, selectedDate]);

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    const times = (groupedAvailabilities[day.dateString] || [])
      .filter(s => !s.isBooked)
      .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    if (times.length > 0) {
      setSelectedTime(times[0]); // <-- Refactored to store object
    } else {
      setSelectedTime(null);
    }
  };

  const morningSlots = availableSlotsForSelectedDate.filter(slot => {
    const localHour = new Date(slot.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', timeZone: getSafeTimezone(slot.timezone) });
    return Number(localHour) < 12;
  });
  const afternoonSlots = availableSlotsForSelectedDate.filter(slot => {
    const localHour = new Date(slot.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', timeZone: getSafeTimezone(slot.timezone) });
    return Number(localHour) >= 12;
  });

  const renderHourChip = (slot: Availability) => {
    const isSelected = selectedTime?.id === slot.id;
    const displayTime = timeHHMM(new Date(slot.startTime), slot.timezone);
    return (
      <Pressable
        key={slot.id}
        onPress={() => setSelectedTime(slot)}
        style={[styles.hourChip, isSelected && styles.hourChipSelected]}
      >
        <Text style={[styles.hourText, isSelected && styles.hourTextSelected]}>{displayTime}</Text>
      </Pressable>
    );
  };

  const onConfirm = async () => {
    if (!PRO || !selectedTime || !selectedDate) {
      Alert.alert('Sélection manquante', 'Choisissez une date et une heure.');
      return;
    }
    
    const note = customReason || '';

    try {
      await api.post(`/appointments`, {
        patientId: parseInt(authState?.user?.sub ?? '', 10),
        practitionerId: PRO.id,
        startTime: selectedTime.startTime,
        notes: note?.trim() || undefined,
      });
      Alert.alert('Succès', `RDV demandé : ${selectedDate} ${timeHHMM(new Date(selectedTime.startTime), selectedTime.timezone)}`);
      router.push(`/(tabs)/my-space`);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Erreur', err?.response?.data?.message || 'Impossible de réserver pour le moment.');
    }
  };

   if (loading || !PRO) {
    return (
      <SafeAreaView style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#1662A9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Enchanté !</Text>
        <View style={styles.card}>
          <View style={styles.avatarWrap}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={44} color="#fff" />
              </View>
          </View>
          <Text style={styles.proName} numberOfLines={2}>
            {PRO?.user?.userName}
          </Text>
          <Text style={styles.specialty}>{PRO.professionalType}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="briefcase-check" size={18} color="#1662A9" />
              <Text style={styles.statLabel}>Expérience</Text>
              <Text style={styles.statValue}>12 ans</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#1662A9" />
              <Text style={styles.statLabel}>Note</Text>
              <Text style={styles.statValue}>{PRO?.rating?.toFixed(1)}4.5</Text>
            </View>
            <View style={styles.statItem}>
              <Localisation />
              <Text style={styles.statLabel}>Localisation</Text>
              <Text style={styles.statValue}>{`${PRO?.city}, ${PRO.country}`}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Mes compétences</Text>
         <View style={styles.specialityContainerButton}>
            {PRO?.specialties?.map((s) => {
                      return (
                        <TouchableOpacity 
                          key={s}
                          style={[styles.specialityBtn]}
                        >
                          <Text style={[styles.specialityBtnText]}>
                            {s}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    </View>
        <Text style={styles.sectionTitle}>Mes disponibilités</Text>
        <View style={styles.calendarWrap}>
          <CalendarList
            horizontal
            pagingEnabled
            calendarWidth={Dimensions.get("window").width - 32}
            pastScrollRange={0}
            futureScrollRange={12}
           onDayPress={onDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: "#EBF2F3",
              calendarBackground: "#EBF2F3",
              textSectionTitleColor: "#222",
              selectedDayBackgroundColor: "#D9FBEA",
              selectedDayTextColor: "#03694B",
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
        <Text style={[styles.sectionTitle]}>Heures</Text>
        <View style={styles.hoursWrap}>
          <Text style={styles.subSectionTitle}>Matin</Text>
          <View style={styles.chipsRow}>
            {morningSlots.length > 0 ? morningSlots.map(renderHourChip) : <Text style={styles.noSlotText}>A créneau le matin</Text>}
          </View>
          <Text style={[styles.subSectionTitle, { marginTop: 12 }]}>Après-midi</Text>
          <View style={styles.chipsRow}>
            {afternoonSlots.length > 0 ? afternoonSlots.map(renderHourChip) : <Text style={styles.noSlotText}>Aucun crén créneau l'après-midi</Text>}
          </View>
        </View>
        <Text style={styles.sectionTitle}>Motif</Text>
        <View style={{ marginBottom: 8 }}>
          <TextInput
            value={customReason}
            onChangeText={(t) => {
              if (t.length <= REASON_MAX) setCustomReason(t);
            }}
            placeholder="Décris rapidement la raison (max 300 caractères)"
            multiline
            style={[styles.motifWrap,]}
          />
        </View>
        <Pressable
          onPress={onConfirm}
          style={({ pressed }) => [
            styles.confirmBtn,
            !selectedTime && styles.confirmBtnDisabled,
            pressed && { opacity: 0.85 },
          ]}
          disabled={!selectedTime}
        >
          <Text style={styles.confirmText}>Confirmer le rendez-vous</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F7" },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F1724",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#DFFCEB",
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "transparent",
    marginTop: -6,
    marginBottom: 6,
  },
  avatar: { width: 92, height: 92, borderRadius: 46 },
  avatarPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#9EEAC8",
    justifyContent: "center",
    alignItems: "center",
  },
  proName: { fontSize: 15, fontWeight: "700", textAlign: "center", marginTop: 6, color: "#0B2E20" },
  specialty: { fontSize: 13, color: "#6B7280", marginTop: 6 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    width: "100%",
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#B4B4B4",
    marginTop: 6,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0B2E20",
    marginTop: 2,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F1724",
    marginTop: 20,
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
  motifWrap: {
     minHeight: 74,
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
  subSectionTitle: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hourChip: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 8,
  },
  hourChipSelected: {
    backgroundColor: "#DFF3E6",
    borderWidth: 1,
    borderColor: "#07A06B",
  },
  hourText: { color: "#374151" },
  hourTextSelected: { color: "#03694B" },
  noSlotText: { color: '#666', fontStyle: 'italic' },
  confirmBtn: {
    width: '80%',
    marginLeft: 42,
    marginTop: 18,
    backgroundColor: "#DFFCEB",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.8,
  },
  confirmText: { color: "#0B2E20", fontWeight: "700", fontSize: 16 },
   meetButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  specialityContainerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  specialityBtn: {
    margin: 8,
    borderColor: '#1662A9',
    borderWidth: 1,
    borderRadius: 19,
    paddingHorizontal: 8,
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
    color: '#fff',
  },
});