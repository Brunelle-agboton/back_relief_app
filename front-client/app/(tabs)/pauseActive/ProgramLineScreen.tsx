import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Text, Button, ScrollView, TouchableOpacity  } from 'react-native';
import {useNavigation, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import api from '../../../services/api';
import { baseURL } from '../../../services/api';
import { Program, ProgramLine } from '../../../interfaces/types';
import { useLocalSearchParams } from 'expo-router';
import { getProgramLines, clearProgramLines } from '../../../utils/ProgramStore';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProgramLineScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation<NavigationProp<any>>();
  const { currentStep } = params;
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const step = parseInt((Array.isArray(currentStep) ? currentStep[0] : currentStep) ?? '0');
  const [stepState, setStep] = useState(step);
  const programLines = getProgramLines();
  const currentLine = programLines[stepState];

  const goToNextStep = () => {
    setIsStarted(false);
    setIsFinished(false);
    if (stepState < programLines.length - 1) {
      setStep(stepState + 1);
    } else {
      clearProgramLines(); // Effacer les lignes de programme après la dernière étape
      navigation.goBack(); // ou navigation.navigate('EcranDeFin')
    }
  };

  if (!currentLine) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentLine.exercise.category}</Text>

      <Image
        source={{ uri: `${baseURL}images/${encodeURIComponent(currentLine.exercise.image)}` }}
        style={styles.image}
        resizeMode="contain"
      />
      <CountdownCircleTimer
       key={stepState}
        isPlaying={isStarted}
        duration={currentLine.duration || 60}
        colors={['#FFAE00', '#F7B801', '#4ADE80']}
        colorsTime={[
          (currentLine.duration ?? 60) * (2 / 3),
          (currentLine.duration ?? 60) * (1 / 3),
          (currentLine.duration ?? 60) * 0.15
        ]}
        
        size={180}
        onComplete={() => {
          setIsFinished(true);
          return { shouldRepeat: false };
        }}
      >
        {({ remainingTime }) => <Text style={styles.timer}>{remainingTime}s</Text>}
      </CountdownCircleTimer>
         <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.start,
            isStarted && { backgroundColor: '#FFAE00' }
          ]}
          onPress={() => setIsStarted(true)}
          disabled={isStarted} // désactive si déjà démarré
        >
          <Text style={[
            styles.buttonText,
            { color: isStarted ? '#fff' : '#FFAE00' }
          ]}>
            Commencer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.end]}
          onPress={goToNextStep}
        >
          <Text style={styles.buttonText}>Terminer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  image: { width: screenWidth * 0.8, height: screenWidth * 0.5, marginBottom: 10 },
  desc: { fontSize: 18, textAlign: 'center', marginBottom: 8 },
  reps: { fontSize: 16, marginBottom: 16 },
  timer: { fontSize: 36, fontWeight: 'bold', color: '#222' },
  buttonRow: { flexDirection: 'row', marginTop: 32 },
  button: { flex: 1, marginHorizontal: 10, padding: 16, borderRadius: 24, alignItems: 'center' },
  start: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#FFAE00' },
  end: { backgroundColor: '#ED6A5E' },
  buttonText: { color: '#ffff', fontWeight: 'bold', fontSize: 18 },
});