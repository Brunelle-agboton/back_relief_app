import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { proName, date, time } = useLocalSearchParams<{ proName: string; date: string; time: string }>();

  const handleGoHome = () => {
    router.replace('/(tabs)'); // Navigate to the main tabs layout
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={100} color="#2c9d8f" />
        <ThemedText type="title" style={styles.title}>Rendez-vous confirmé !</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Votre rendez-vous avec {proName} est bien enregistré.
        </ThemedText>
        
        <View style={styles.detailsBox}>
          <ThemedText type="defaultSemiBold">Détails du rendez-vous :</ThemedText>
          <Text style={styles.detailsText}>Date : {date}</Text>
          <Text style={styles.detailsText}>Heure : {time}</Text>
        </View>

        <Button title="Retour à l'accueil" onPress={handleGoHome} color="#007BFF" />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 25,
    color: '#666',
  },
  detailsBox: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    width: '100%',
  },
  detailsText: {
    fontSize: 16,
    marginTop: 5,
  },
});
