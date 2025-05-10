import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Text, Button, ScrollView  } from 'react-native';
import {useNavigation, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import api from '../../services/api';

type RootStackParamList = {
  'screens/PauseDetailScreen': { 
    pauseId: number;
    imageUri: string };

}

type Pause = {
  id: number;
  contentTitle: string;
  position: string;
  calories: number;
  steps: Array<{
    contentDescription: string;
    image: string;
    reps?: number;
    duration: number;
  }>;
  category?: string;
};
  

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PauseImageScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'screens/PauseDetailScreen'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { imageUri } = route.params;
  const [pause, setPause] = useState<Pause | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchPause = async () => {
      try {
        const response = await api.get(`/rest/${route.params.pauseId}`);
        const pauseData = response.data;
        setPause(pauseData);
      } catch (error) {
        console.error('Erreur lors de la récupération de la pause:', error);
      }
    };
    fetchPause();
  }, [route.params.pauseId]);
  if (!pause) {
    return null; // ou un indicateur de chargement
  }
  const step = pause.steps[currentStep];
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.contentTitle}>{pause.contentTitle}</Text>
      <Image
        source={{ uri: imageUri }}
        style={styles.fullImage}
        resizeMode="contain"
      />
      <Text style={styles.desc}>{step.contentDescription}</Text>

      {/* Timer en secondes ou reps */}
      <CountdownCircleTimer
        isPlaying
        duration={step.reps ? step.reps : step.duration}
        colors={['#004777', '#F7B801', '#A30000']}
        colorsTime={[step.duration * (2/3), step.duration * (1/3), step.duration * 0.15]}
        onComplete={() => currentStep + 1 < pause.steps.length 
          ? setCurrentStep(currentStep + 1) 
          : navigation.goBack()}
      />

      <Button
        title={currentStep + 1 < pause.steps.length ? "Suivant" : "Terminer"}
        onPress={() => {
          if (currentStep + 1 < pause.steps.length)
            setCurrentStep(currentStep + 1);
          else
            navigation.goBack();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  fullImage: {
    width: screenWidth,
    height: screenHeight,
  },
    contentTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    desc: {
        fontSize: 16,
        marginBottom: 20,
    },
});
