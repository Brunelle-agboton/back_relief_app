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

const timeHHMM = (isoOrDate: string | Date) => {
  const d = new Date(isoOrDate);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

export default function ProBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
    const id = params.id ? Number(params.id) : undefined;
  const { authState } = useAuth();

  // const PRO = { ...params, years: 12,
  // rating: 5.0,}
    const [loading, setLoading] = useState<boolean>(true);
  const [PRO, setPRO] = useState<PractitionerProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDate());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
const [customReason, setCustomReason] = useState<string>(''); // edit text
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
        // Adapte l'endpoint à ton API (ex: /practitioners/:id ou /teleconsultation/practitioners/:id)
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

 // Grouper availabilities par date locale (YYYY-MM-DD)
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

  // marquer les dates (markedDates pour CalendarList)
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    Object.keys(groupedAvailabilities).forEach(date => {
      // dot + background possible : on ajoute marked + custom styles, et selection si égal selectedDate
      marks[date] = { marked: true, dotColor: '#1662A9' };
    });
    if (selectedDate) {
      marks[selectedDate] = { ...(marks[selectedDate] || {}), selected: true, selectedColor: '#D9FBEA', selectedTextColor: '#03694B' };
    }
    return marks;
  }, [groupedAvailabilities, selectedDate]);

  // Quand on récupère le profil, si il y a des disponibilités on sélectionne la première date+heure.
  useEffect(() => {
    if (!PRO) return;
    const allSlots = [...(PRO.availabilities || [])]
      .filter(s => !s.isBooked)
      .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    if (allSlots.length === 0) {
      // Pas de dispo du tout
      Alert.alert('Aucune disponibilité', 'Aucune dispo pour ce praticien.');
      // tu peux router.back() si tu veux quitter l'écran automatiquement
      // router.back();
      setSelectedDate(null);
      setSelectedTime(null);
      return;
    }
    // premier créneau non-booké
    const first = allSlots[0];
    const firstDate = toLocalYYYYMMDD(new Date(first.startTime));
    const firstTime = timeHHMM(new Date(first.startTime));

    setSelectedDate(prev => prev ?? firstDate); // si déjà sélectionné on garde, sinon preset
    setSelectedTime(prev => prev ?? firstTime);
  }, [PRO]);

  // Obtenir la liste des heures disponibles pour la date sélectionnée (triées, format HH:MM)
  const availableTimesForSelectedDate: string[] = useMemo(() => {
    if (!selectedDate) return [];
    const slots = groupedAvailabilities[selectedDate] || [];
    const times = slots
      .filter(s => !s.isBooked)
      .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .map(s => timeHHMM(new Date(s.startTime)));
    // remove duplicates (si jamais)
    return Array.from(new Set(times));
  }, [groupedAvailabilities, selectedDate]);

  // Lorsqu'on clique sur un jour dans le calendrier
  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    // automatiquement sélectionner la première dispo de ce jour (si existe)
    const times = (groupedAvailabilities[day.dateString] || [])
      .filter(s => !s.isBooked)
      .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    if (times.length > 0) {
      setSelectedTime(timeHHMM(new Date(times[0].startTime)));
    } else {
      setSelectedTime(null);
    }
  };

  // Organisation Matin / Après-midi
  const morningSlots = availableTimesForSelectedDate.filter(t => Number(t.split(':')[0]) < 12);
  const afternoonSlots = availableTimesForSelectedDate.filter(t => Number(t.split(':')[0]) >= 12);

  // Render hour chip (tu avais déjà renderHourChip)
  const renderHourChip = (time: string) => {
    const selected = selectedTime === time;
    return (
      <Pressable
        key={time}
        onPress={() => setSelectedTime(time)}
        style={[styles.hourChip, selected && styles.hourChipSelected]}
      >
        <Text style={[styles.hourText, selected && styles.hourTextSelected]}>{time}</Text>
      </Pressable>
    );
  };

const onConfirm = async () => {
  if (!PRO || !selectedTime || !selectedDate) {
    Alert.alert('Sélection manquante', 'Choisissez une date et une heure.');
    return;
  }
  
  // construit le note : priorise customReason s'il existe
  const note = customReason || '';

  try {
    await api.post(`/appointments`, {
      patientId: parseInt(authState?.user?.sub ?? '', 10),
      practitionerId: PRO.id,
      date: selectedDate,
      time: selectedTime,
      note: note?.trim() || undefined,
    });
    Alert.alert('Succès', `RDV demandé : ${selectedDate} ${selectedTime}`);
    // rafraîchir / rediriger selon ton flow
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
      {/* <Stack.Screen options={{ title: "" }} /> */}

      <ScrollView contentContainerStyle={styles.container}>
        {/* Title */}
        <Text style={styles.title}>Enchanté !</Text>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.avatarWrap}>
            {/* {PRO?.avatar ? (
              <Image source={{ uri:  'https://images.unsplash.com/photo-1633332755192-727a05c4013d' }} style={styles.avatar} />
            ) : ( */}
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={44} color="#fff" />
              </View>
            {/* )} */}
          </View>

          <Text style={styles.proName} numberOfLines={2}>
            {PRO?.user.userName}
          </Text>
          <Text style={styles.specialty}>{PRO.professionalType}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="briefcase-check" size={18} color="#1662A9" />
              <Text style={styles.statLabel}>Expérience</Text>
              {/* {PRO.years} */}
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
{/* Mes compétences */}
        <Text style={styles.sectionTitle}>Mes compétences</Text>
         <View style={styles.specialityContainerButton}>
            {PRO?.specialties?.map((s) => {
                      return (
                        <TouchableOpacity 
                          key={s} // Toujours utiliser une clé unique pour les éléments de la liste
                          style={[styles.specialityBtn]}
                    
                        >
                          <Text style={[styles.specialityBtnText]}>
                            {s}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    </View>
        {/* Mes disponibilités */}
        <Text style={styles.sectionTitle}>Mes disponibilités</Text>

        {/* Calendar (react-native-calendars) */}
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

        {/* Heures */}
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
        {/* Motif */}
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
        {/* Confirm button */}
        <Pressable
          onPress={() => {
          if (!selectedDate || !selectedTime) {
              Alert.alert('Sélection manquante', 'Choisissez une date et une heure.');
              return;
            }
            // ici ton comportement de confirmation (call API / navigation)
            console.log('Confirm', { practitionerId: PRO.id, date: selectedDate, time: selectedTime });
            Alert.alert('RDV demandé', `${selectedDate} ${selectedTime}`);
          }}
          style={({ pressed }) => [
            styles.confirmBtn,
            !(selectedTime && selectedDate) && styles.confirmBtnDisabled,
            pressed && { opacity: 0.85 },
          ]}
          disabled={!(selectedTime && selectedDate)}
        >
          <Text style={styles.confirmText}>Confirmer le rendez-vous</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* --- Styles --- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F7" },
  container: {
    padding: 16,
    paddingBottom: 40,
  },

  /* Title */
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F1724",
    marginBottom: 12,
  },

  /* Card */
  card: {
    backgroundColor: "#DFFCEB", // mint pale
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 18,
    // shadow
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

  /* Sections */
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
    // drop shadow subtle
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },

  /* Hours */
  hoursWrap: {
    backgroundColor: "#EBF2F3",
    borderRadius: 24,
    padding: 12,
    marginTop: 10,
    // shadow subtle
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },motifWrap: {
     minHeight: 74,
    backgroundColor: "#EBF2F3",
    borderRadius: 24,
    padding: 12,
    marginTop: 10,
    // shadow subtle
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
    gap: 8, // ios/android newer RN support; fallback with margin
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
  noSlotText: { color: '#666', fontStyle: 'italic' } as any,

  /* Confirm */
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
