import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Text, Button, ScrollView, TouchableOpacity  } from 'react-native';
import {useNavigation, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import api from '../../../services/api';
import { Program, ProgramLine } from '../../../interfaces/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { setProgramLines } from '../../../utils/ProgramStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProgramDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigation = useNavigation<NavigationProp<any>>();
  const [program, setProgram] = useState<Program | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const id = params.programId;

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await api.get(`/program/${id}`);
        setProgram(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération de la pause:', error);
      }
    };
    fetchProgram();
  }, [params.programId]);

  if (!program) {
    return null; // ou un indicateur de chargement
  }
  const totalDuration = program?.lines?.reduce((sum, line) => sum + (line.duration || 0), 0) || 0;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: `http://localhost:3000/images/${encodeURIComponent(program.image)}` }}
        style={styles.fullImage}
        resizeMode="contain"
      />
     <View style={styles.durationBadge}>
      <Text style={styles.durationText}>
        {Math.round(totalDuration / 60) || 1}min
        </Text>
      </View>
      {/* Boutons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4ADE80' }]}
          onPress={() =>{
            setProgramLines(program.lines);
            router.push({
              pathname :'/(tabs)/pauseActive/ProgramLineScreen', 
              params :{currentStep: 0,
            }})
          }}
        >
          <Text style={styles.buttonText}>Commencer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#F87171' }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Terminer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  fullImage: { width: screenWidth, height: screenWidth * 1.3, marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  desc: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  stepsContainer: { marginBottom: 24 },
  step: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 24, marginBottom: 8 },
  stepText: { fontSize: 16 },
  stepSubText: { fontSize: 16, fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 32 },
  button: { flex: 1, marginHorizontal: 10, padding: 16, borderRadius: 24, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

  durationBadge: {
  position: 'absolute',
  bottom: 95,
  right: 14,
  width: 84,
  height: 84,
  backgroundColor: '#fff',
  borderRadius: 42,
  borderWidth: 6,
  borderColor: '#FFAE00', // jaune/orangé
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 4,
},
durationText: {
  color: '#4ADE80',
  fontWeight: 'bold',
  fontSize: 16,
},
});