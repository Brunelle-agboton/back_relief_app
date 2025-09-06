import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { CalendarList } from "react-native-calendars";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Localisation  from '@/assets/images/Consultation/Localisation.svg';

/* ---------------------------
  Exemple de données (remplace par ton fetch)
----------------------------*/
const PRO = {
  id: "1",
  name: "Dr Frizzero Vicenzi Tantely",
  specialty: "Kinésithérapeute",
  years: 12,
  rating: 5.0,
  location: "Quebec, Canada",
  avatar: "", // laisse vide pour placeholder
};

/* Heures mock (structure simple) */
const HOURS = {
  morning: ["9 : 00", "10 : 00", "10 : 20", "10 : 40", "11 : 20", "11 : 40"],
  afternoon: ["17 : 00", "17 : 40", "18 : 20", "19 : 40"],
};

/* Format utilitaire pour react-native-calendars (YYYY-MM-DD) */
const formatDate = (d = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function ProBookingScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(formatDate());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Marked dates for CalendarList
  const markedDates = useMemo(() => {
    return {
      [selectedDate]: {
        selected: true,
        selectedColor: "#D9FBEA", // mint highlight
        selectedTextColor: "#03694B",
      },
    };
  }, [selectedDate]);

  const onConfirm = () => {
    // Navigue vers confirmation ou envoie la requête
    // Par ex: router.push({ pathname: '/teleconsultation/confirm', params: { id: PRO.id, date: selectedDate, time: selectedTime } })
    console.log("confirm", { date: selectedDate, time: selectedTime });
    // placeholder
    alert(`Rendez-vous demandé : ${selectedDate} ${selectedTime ?? ""}`);
  };

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

  return (
    <SafeAreaView style={styles.safe}>
      {/* <Stack.Screen options={{ title: "" }} /> */}

      <ScrollView contentContainerStyle={styles.container}>
        {/* Title */}
        <Text style={styles.title}>Enchanté !</Text>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.avatarWrap}>
            {PRO.avatar ? (
              <Image source={{ uri: PRO.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={44} color="#fff" />
              </View>
            )}
          </View>

          <Text style={styles.proName} numberOfLines={2}>
            {PRO.name}
          </Text>
          <Text style={styles.specialty}>{PRO.specialty}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="briefcase-check" size={18} color="#1662A9" />
              <Text style={styles.statLabel}>Expérience</Text>
              <Text style={styles.statValue}>{PRO.years} ans</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#1662A9" />
              <Text style={styles.statLabel}>Note</Text>
              <Text style={styles.statValue}>{PRO.rating.toFixed(1)}</Text>
            </View>

            <View style={styles.statItem}>
              <Localisation />
              <Text style={styles.statLabel}>Localisation</Text>
              <Text style={styles.statValue}>{PRO.location}</Text>
            </View>
          </View>
        </View>
{/* Mes compétences */}
        <Text style={styles.sectionTitle}>Mes compétences</Text>
            <View style={styles.meetButton}>
                <TouchableOpacity style={styles.cancelBtn}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{  fontWeight: '600', fontSize: 14 }}>Lombalgie</Text>
                  </View>
                </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{  fontWeight: '600', fontSize: 14 }}>A compléter</Text>
                  </View>
                </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{  fontWeight: '600', fontSize: 14 }}>...</Text>
                  </View>
                </TouchableOpacity>
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
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setSelectedTime(null);
            }}
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
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Heures</Text>

        <View style={styles.hoursWrap}>
          <Text style={styles.subSectionTitle}>Matin</Text>
          <View style={styles.chipsRow}>
            {HOURS.morning.map(renderHourChip)}
          </View>

          <Text style={[styles.subSectionTitle, { marginTop: 12 }]}>Après-midi</Text>
          <View style={styles.chipsRow}>
            {HOURS.afternoon.map(renderHourChip)}
          </View>
        </View>

        {/* Confirm button */}
        <Pressable
          onPress={onConfirm}
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
  cancelBtn: {
    margin: 12,
    alignItems: "center",
    borderColor: '#1662A9' ,
    borderWidth: 1,
    borderRadius: 19,
    paddingHorizontal: 18,
paddingVertical: 8,
  },
});
