import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { usePractitioner } from '@/context/PractitionerContext'; // Corrected import path
import api from '@/services/api'; // Import the API service

// Helper to group appointments by date (reused from availability.tsx)
const groupAppointmentsByDate = (appointments: any[]) => {
  if (!appointments) return {};
  return appointments.reduce((acc: Record<string, any[]>, appointment: any) => {
    const date = new Date(appointment.start_at).toLocaleDateString('en-CA'); // YYYY-MM-DD format
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    // Sort by start time
    acc[date].sort((a: any, b: any) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
    return acc;
  }, {});
};

const ProHomeScreen = () => {
  const router = useRouter();
  const { profile, isLoading, error } = usePractitioner();

  // State for appointments
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (profile?.id) { // Only fetch if profile ID is available
        setIsAppointmentsLoading(true);
        try {
          const response = await api.get(`/appointments/practitioner/${profile.id}`);
          console.log(response.data);
          setAppointments(response.data);
          setAppointmentsError(null);
        } catch (err: any) {
          setAppointmentsError(err.response?.data?.message || 'Failed to fetch appointments.');
        } finally {
          setIsAppointmentsLoading(false);
        }
      }
    };

    fetchAppointments();
  }, [profile?.id]); // Dependency on profile.id

  // Filter upcoming appointments for display on dashboard
  const upcomingAppointments = appointments.filter(app => new Date(app.start_at) > new Date());
  upcomingAppointments.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  const limitedUpcomingAppointments = upcomingAppointments.slice(0, 3); // Show top 3 upcoming

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#1662A9" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
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
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {profile?.user?.userName || 'Professional'}!</Text>
        <Text style={styles.subtitle}>This is your dashboard.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming Appointments</Text>
          {isAppointmentsLoading ? (
            <ActivityIndicator size="small" color="#1662A9" style={{ marginTop: 10 }} />
          ) : appointmentsError ? (
            <Text style={styles.errorText}>Error: {appointmentsError}</Text>
          ) : limitedUpcomingAppointments.length > 0 ? (
            limitedUpcomingAppointments.map(appointment => (
              <View key={appointment.id} style={styles.appointmentItem}>
                <Text style={styles.appointmentTime}>
                  {new Date(appointment.start_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {new Date(appointment.start_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </Text>
                <Text style={styles.appointmentDetails}>
                  Patient: {appointment.patient?.userName || 'N/A'}
                </Text>
                {appointment.notes && (
                  <Text style={styles.appointmentDetails}>Note: {appointment.notes}</Text>
                )}
                <Text style={styles.appointmentStatus}>Status: {appointment.status}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.cardText}>You have no upcoming appointments.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Patients</Text>
          <Text style={styles.cardText}>View and manage your patient list.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Availability</Text>
          <TouchableOpacity style={styles.specialityBtn} 
         onPress={() => router.push('/(pro)/availability')}
            accessibilityRole="button"
            accessibilityLabel="Gérer vos disponibilités"
          >
            <Text style={styles.specialityBtnText}>Manage your schedule</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a202c',
  },
  subtitle: {
    fontSize: 18,
    color: '#4a5568',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2d3748',
  },
  cardText: {
    fontSize: 16,
    color: '#718096',
  },
    specialityBtn: {
    margin: 8,
    borderColor: '#1662A9',
    borderWidth: 1,
    borderRadius: 19,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  specialityBtnText: {
    color: '#1662A9',
    fontWeight: '600',
  },
  appointmentItem: { // New style for appointment items (reused from availability.tsx)
    backgroundColor: '#f0f8ff', // Light blue background
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1662A9',
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  appointmentDetails: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 2,
  },
  appointmentStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c9d8f', // Green for confirmed
    marginTop: 4,
  },
});

export default ProHomeScreen;
