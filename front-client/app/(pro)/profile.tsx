import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  Alert,
  Pressable,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Localisation from '@/assets/images/Consultation/Localisation.svg';
import { usePractitioner } from "@/context/PractitionerContext";
import NextMeetingCard from '@/components/NextMeetingCard';
import { Appointment } from '@/interfaces/types';
import Modifier from '@/assets/images/Consultation/Modifier.svg';


const MyPatientsView = () => {
  const { profile } = usePractitioner();
  const [interviewAppointments, setInterviewAppointments] = useState<Appointment[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const allUpcomingAppointments = useMemo(() => {
    const patientAppointments = (profile?.appointments || []);
    const markedInterviewAppointments = interviewAppointments.map(a => ({ ...a, isInterview: true }));
    const combined = [...patientAppointments, ...markedInterviewAppointments];
    combined.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
    return combined;
  }, [profile, interviewAppointments]);
  return (
    <SafeAreaView>
      <ScrollView>
        <Text>A Venir</Text>
      </ScrollView>
    </SafeAreaView>
  );
};
const MyProfileView = () => {
  const { profile, isLoading, error } = usePractitioner();
  const router = useRouter();

  if (isLoading) {
    return <View style={styles.centered}><Text>Chargement du profil...</Text></View>;
  }

  if (error) {
    return <View style={styles.centered}><Text>Erreur: {error}</Text></View>;
  }

  if (!profile) {
    return <View style={styles.centered}><Text>Aucun profil trouvé. Veuillez compléter votre profil.</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.push("/(pro)/agenda")} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.title}>Mon profil</Text>
        <Modifier />
      </TouchableOpacity>
      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={44} color="#fff" />
          </View>
        </View>
        <Text style={styles.proName} numberOfLines={2}>
          {profile?.user?.userName}
        </Text>
        <Text style={styles.specialty}>{profile?.professionalType}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="briefcase-check" size={18} color="#1662A9" />
            <Text style={styles.statLabel}>Expérience</Text>
            <Text style={styles.statValue}>12 ans</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star" size={18} color="#1662A9" />
            <Text style={styles.statLabel}>Note</Text>
            <Text style={styles.statValue}>{profile?.rating?.toFixed(1) || 'N/A'}</Text>
          </View>
          <View style={styles.statItem}>
            <Localisation />
            <Text style={styles.statLabel}>Localisation</Text>
            <Text style={styles.statValue}>{`${profile?.city}, ${profile?.country}`}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Mes compétences</Text>
      <View style={styles.specialityContainerButton}>
        {profile?.specialties?.map((s) => {
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
    </ScrollView>
  );
};

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('planning');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'planning' && styles.activeTab]}
            onPress={() => setActiveTab('planning')}
          >
            <Text style={[styles.tabText, activeTab === 'planning' && styles.activeTabText]}>Mes patients</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'availability' && styles.activeTab]}
            onPress={() => setActiveTab('availability')}
          >
            <Text style={[styles.tabText, activeTab === 'availability' && styles.activeTabText]}>Mon profil</Text>
          </TouchableOpacity>
        </View>
        {activeTab === 'planning' ? <MyPatientsView /> : <MyProfileView />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F8" },
  container: { paddingHorizontal: 16, paddingTop: 12 },

  title: {
    fontSize: 18,
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 4,
    borderColor: "#1662A9"
  },
  tabText: {
    color: '#1662A9',
  },
  activeTabText: {
    color: '#1662A9',
    fontWeight: 'bold',

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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default ProfileScreen;
