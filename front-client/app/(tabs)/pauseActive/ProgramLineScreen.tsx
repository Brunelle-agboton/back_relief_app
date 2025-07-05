import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Text, Button, ScrollView, TouchableOpacity  } from 'react-native';
import {useNavigation, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import api from '../../../services/api';
import { baseURL } from '../../../services/api';
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
  let userId: string|null;

   const startExercise = async () => {
    setIsStarted(true);
    try {
      await api.post('/activity', {
        type: 'pause_started',
        metadata: {
          exerciceId: currentLine.exercise.id,
          lineOrder: currentLine.order,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

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

  const finishExercise = async () => {
    goToNextStep();
    try {
      await api.post('/activity', {
        type: 'pause_completed',
        metadata: {
          exerciceId: Number(currentLine.exercise.id),
          lineOrder: Number(currentLine.order),
        },
      });
    } catch (err) {
      console.error(err);
    }
  };
  if (!currentLine) return null;

  return (
    <View style={styles.container}>
       {/* HEADER : titre + calories */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{currentLine.exercise.category}</Text>
        <Text style={styles.calories}>
          {currentLine.calories} kcal
        </Text>
      </View>

      <View style={styles.card}>

      <Image
        source={{ uri: `${baseURL}images/${encodeURIComponent(currentLine.exercise.image)}` }}
        style={styles.image}
        resizeMode="contain"
      />
      </View>

      {/* TIMER CIRCLE */}
      <CountdownCircleTimer
       key={stepState}
        isPlaying={isStarted}
        duration={currentLine.duration || 60}
        colors={['#FFAE00', '#F7B801', '#ED6A5E']}
        colorsTime={[
          (currentLine.duration ?? 60) * (2 / 3),
          (currentLine.duration ?? 60) * (1 / 3),
          (currentLine.duration ?? 60) * 0.15
        ]}
        
        size={200}
        strokeWidth={8}
        onComplete={() => {
          setIsFinished(true);
          return { shouldRepeat: false };
        }}
      >
        {({ remainingTime }) => 
          <Text style={styles.timer}>
            {`${Math.floor(remainingTime / 60)
                .toString()
                .padStart(2, '0')}:${(remainingTime % 60)
                .toString()
                .padStart(2, '0')}`}
          </Text>}
      </CountdownCircleTimer>
         <View style={styles.buttonRow}>
         {/* PLAY BUTTON */}
      {!isStarted && (
        <TouchableOpacity
          style={styles.playButton}
          onPress={startExercise}
        >
          <View style={styles.playIcon} />
        </TouchableOpacity>
      )}

      {/* FINISH BUTTON */}
      {isStarted && (
        <TouchableOpacity
          style={[styles.actionButton, styles.finishButton]}
          onPress={finishExercise}
        >
          <Text style={styles.actionText}>Terminer</Text>
        </TouchableOpacity>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 20 },
  headerRow: {
     width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, paddingLeft: 30, },
  calories: {
    fontSize: 16,
    color: '#666',
     paddingRight: 30,
  },
  card: {
    width: '90%',
    height: 200,
    backgroundColor: '#fff',
    marginBottom: 24,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee',
    boxShadow: '10px 4px 0 8px rgba(3, 3, 3, 0.1)',
    shadowColor: '#00000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    elevation: 5,
  },
  image: { width: screenWidth * 0.8, height: screenWidth * 0.5, marginBottom: 10 },
  desc: { fontSize: 18, textAlign: 'center', marginBottom: 8 },
  reps: { fontSize: 16, marginBottom: 16 },
  timer: { fontSize: 36, fontWeight: 'bold', color: '#222' },
  buttonRow: { flexDirection: 'row', marginTop: 32 },
  button: { flex: 1, marginHorizontal: 10, padding: 16, borderRadius: 24, alignItems: 'center' },
  start: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#FFAE00' },
  end: { backgroundColor: '#ED6A5E' },
  buttonText: { color: '#ffff', fontWeight: 'bold', fontSize: 18 },
  //  image: {
  //   width: IMAGE_SIZE,
  //   height: IMAGE_SIZE,
  // },
  timerContainer: {
    marginBottom: 24,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFAE00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: '#fff',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  actionButton: {
    width: '60%',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  finishButton: {
    backgroundColor: '#333',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});