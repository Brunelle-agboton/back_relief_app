import React, { useMemo, useState, useEffect, useCallback, useRef  } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl, Alert, TouchableOpacity,  Animated 
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { usePractitioner } from '@/context/PractitionerContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Appointment } from '@/interfaces/types';
import NextMeetingCard from '@/components/NextMeetingCard';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// --- Date Helper Functions ---
const isoDateKey = (d: Date): string => d.toISOString().split('T')[0];
const dayShort = (d: Date): string => d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3);
const dayNumber = (d: Date): string => String(d.getDate());
const monthLabel = (d: Date): string => d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

const renderAppointment = ({ item }: { item: Appointment }) => {
  const appointmentDate = new Date(item.start_at);
  const cardProps = {
    isMeeting: false,
    date: appointmentDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
    time: appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    reason: item.notes || 'Aucun motif spécifié',
    onCancel: () => Alert.alert('Annulation', `Annuler le RDV ID: ${item.id}?`),
    onJoin: () => Alert.alert('Rejoindre', `Rejoindre la visio pour le RDV ID: ${item.id}`),
    item: {
      id: item.id,
      imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
      name: item.isInterview ? (item.practitioner.professionalType || 'Admin') : (item.patient.userName || 'Patient inconnu'),
      specialty: item.isInterview ? 'Entretien de validation' : `Patient - ${item.patient.email}`,
      location: item.isInterview ? item.practitioner.city : 'En ligne',
    }
  };
  return <NextMeetingCard {...cardProps} />;
};

export default function ProDashboard() {
  const router = useRouter();
  const { profile, loading: loadingProfile, refetch: refetchProfile } = usePractitioner();
  const { authState, isLoading } = useAuth();

  const [interviewAppointments, setInterviewAppointments] = useState<Appointment[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for the calendar
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(isoDateKey(new Date()));

  // Crée trois Animated.Value pour piloter l’opacité de chaque chevron
    const chevrons = [
      useRef(new Animated.Value(0)).current,
      useRef(new Animated.Value(0)).current,
      useRef(new Animated.Value(0)).current,
    ];
     // Animated value pour le scale
    const scaleAnim = useRef(new Animated.Value(1)).current;
  
    // Fonction qui joue l’animation chevronsF
      const animateChevrons = useCallback(() => {
        // Réinitialiser
        chevrons.forEach(c => c.setValue(0));
    
        // Compose et lance
        const loops = chevrons.map((value, i) =>
          Animated.loop(
            Animated.sequence([
              Animated.delay(i * 300),
              Animated.timing(value, { toValue: 1, duration: 300, useNativeDriver: true }),
              Animated.timing(value, { toValue: 0, duration: 380, useNativeDriver: true }),
            ]),
            { resetBeforeIteration: true }  // important pour relancer proprement
          )
        );
        Animated.parallel(loops).start();
      }, [chevrons]);
    
      // Fonction qui pop le score
      const animateScore = useCallback(() => {
        scaleAnim.setValue(1);
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1,   duration: 200, useNativeDriver: true }),
        ]).start();
      }, [scaleAnim]);
    

  const fetchInterviewAppointments = useCallback(async () => {
    if (!authState.user?.sub) return;
    try {
      setLoadingInterviews(true);
      const response = await api.get<Appointment[]>(`/appointments/as-patient/${authState.user.sub}`);
      setInterviewAppointments(response.data);
    } catch (error) {
      console.error("Failed to fetch interview appointments:", error);
    } finally {
      setLoadingInterviews(false);
    }
  }, [authState.user]);

   // useFocusEffect appelle loadStats à chaque fois que l'écran gagne le focus
    useFocusEffect(
      React.useCallback(() => {
     if (authState.isAuthenticated && !isLoading) {
        animateChevrons();
        animateScore();
      }
    }, [authState.isAuthenticated, isLoading, animateChevrons, animateScore])
  );
    
  useEffect(() => {
    fetchInterviewAppointments();
  }, [fetchInterviewAppointments]);

  const allUpcomingAppointments = useMemo(() => {
    const patientAppointments = (profile?.appointments || []).filter(a => new Date(a.start_at) > new Date());
    const markedInterviewAppointments = interviewAppointments.map(a => ({ ...a, isInterview: true }));
    const combined = [...patientAppointments, ...markedInterviewAppointments];
    combined.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
    return combined;
  }, [profile, interviewAppointments]);

  // Group appointments by date for the calendar dots and filtering
  const groupedAppointments = useMemo(() => {
    return allUpcomingAppointments.reduce((acc, appointment) => {
      const key = isoDateKey(new Date(appointment.start_at));
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(appointment);
      return acc;
    }, {} as Record<string, Appointment[]>);
  }, [allUpcomingAppointments]);

  // Calendar logic
  const visibleWeek = useMemo(() => {
    const startOfWeek = new Date(weekAnchor);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday as start of week
    startOfWeek.setDate(diff);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekAnchor]);

  const previousWeek = () => setWeekAnchor(d => new Date(d.setDate(d.getDate() - 7)));
  const nextWeek = () => setWeekAnchor(d => new Date(d.setDate(d.getDate() + 7)));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), fetchInterviewAppointments()]);
    setRefreshing(false);
  }, [refetchProfile, fetchInterviewAppointments]);

  if (loadingProfile || (loadingInterviews && interviewAppointments.length === 0)) {
    return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color="#1662A9" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Accueil</Text>
        <TouchableOpacity onPress={() => router.push("/(pro)/availability")}>
          <Text style={styles.editLink}>Modifier</Text>
        </TouchableOpacity>
      </View>

      {/* WEEK NAV */}
      <View style={styles.weekNav}>
        <TouchableOpacity onPress={previousWeek} style={styles.chevronBtn} accessibilityLabel="Semaine précédente">
          <Ionicons name="chevron-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={styles.weekCenter}>
          <Text style={styles.weekMonthLabel}>{monthLabel(weekAnchor)}</Text>
          <View style={styles.weekDaysRow}>
            {visibleWeek.map((d) => {
              const key = isoDateKey(d);
              const isSelected = key === selectedDateKey;
              const hasAppointments = Array.isArray(groupedAppointments[key]) && groupedAppointments[key].length > 0;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedDateKey(key)}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  accessibilityLabel={`Sélectionner ${d.toLocaleDateString("fr-FR")}`}>
                  <Text style={[styles.dayShort, isSelected && styles.dayShortSelected]}>{dayShort(d)}</Text>
                  <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>{dayNumber(d)}</Text>
                  {hasAppointments && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <TouchableOpacity onPress={nextWeek} style={styles.chevronBtn} accessibilityLabel="Semaine suivante">
          <Ionicons name="chevron-forward" size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={groupedAppointments[selectedDateKey] || []}
        renderItem={renderAppointment}
        keyExtractor={(item) => `${item.id}-${item.isInterview}`}
        ListHeaderComponent={<Text style={styles.subTitle}>Rendez-vous du jour</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun rendez-vous pour cette date.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 200 }}
      />
      {/* Bouton */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/(tabs)/pauseActive')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Accéder aux exercices</Text>
               <View style={styles.chevronContainer}>
              {chevrons.map((anim, i) => (
                <Animated.View key={i} style={{ opacity: anim, marginLeft: i === 0 ? 2 : 0 }}>
                  <FontAwesome name="chevron-right" size={38} color="#fff" />
                </Animated.View>
              ))}
            </View>
            </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, backgroundColor: '#fff' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 15 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  editLink: { fontSize: 16, color: '#1662A9', fontWeight: '600' },
  subTitle: { fontSize: 20, fontWeight: '600', marginBottom: 15, color: '#444' },
  emptyText: { textAlign: 'center', marginTop: 30, fontSize: 16, color: '#888' },
  // Calendar Styles
  weekNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  chevronBtn: { padding: 1 , marginBottom: 66 },
  weekCenter: { flex: 1 },
  weekMonthLabel: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 10 },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around' },
  dayCell: { alignItems: 'center', padding: 5, borderRadius: 12, width: 40, backgroundColor: '#E2E2E2', margin: 2 },
  dayCellSelected: { backgroundColor: '#1662A9' },
  dayShort: { fontSize: 12, textTransform: 'uppercase', color: '#6B7280' },
  dayShortSelected: { color: '#fff' },
  dayNum: { fontSize: 16, fontWeight: 'bold', marginTop: 4, color: '#374151' },
  dayNumSelected: { color: '#fff' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1662A9', marginTop: 4 },
  dotSelected: { backgroundColor: '#fff' },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FF6B61',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
   chevronContainer: {
    flexDirection: 'row',
    marginLeft:    12,
  },
});