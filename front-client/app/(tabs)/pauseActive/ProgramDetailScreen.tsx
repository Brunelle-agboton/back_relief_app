import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { View, Image, StyleSheet, Dimensions, Text, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Entypo from '@expo/vector-icons/Entypo';
import api from '../../../services/api';
import { Program } from '../../../interfaces/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { setProgramLines } from '../../../utils/ProgramStore';
import { baseURL } from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const FAV_PROGRAMS_KEY = '@fav_programs';

export default function ProgramDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigation = useNavigation<NavigationProp<any>>();
  const [program, setProgram] = useState<Program | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFavProgram, setIsFavProgram] = useState(false);
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

    (async () => {
      const raw = await AsyncStorage.getItem(FAV_PROGRAMS_KEY);
      let list: number[] = [];
      try {
        const parsed = raw ? JSON.parse(raw) : [];
        list = Array.isArray(parsed) ? parsed : [];
      } catch {
        list = [];
      }
      setIsFavProgram(list.includes(Number(params.programId)));
    })();

  }, [params.programId]);


  const toggleFavProgram = useCallback(async () => {
    if (!program) return;
    const raw = await AsyncStorage.getItem(FAV_PROGRAMS_KEY);
    let list: number[] = [];
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      list = [];
    }

    const idx = list.indexOf(program.id);
    const next = idx < 0;
    if (next) list.push(program.id);
    else list.splice(idx, 1);

    await AsyncStorage.setItem(FAV_PROGRAMS_KEY, JSON.stringify(list));
    setIsFavProgram(next);
  }, [program?.id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleFavProgram} style={{ marginRight: 16 }}>
          <FontAwesome
            name={isFavProgram ? 'star' : 'star-o'}
            size={26}
            color={isFavProgram ? '#E53E3E' : '#333'}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isFavProgram, toggleFavProgram]);


  if (!program) {
    return null; // ou un indicateur de chargement
  }
  const totalSec =
    program.lines.reduce(
      (sum: number, line: any) => sum + (line.duration || 0),
      0
    ) || 120;

  // Format mm:ss
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');

  const onStart = () => {
    setProgramLines(program.lines);
    router.push({
      pathname: '/(tabs)/pauseActive/ProgramLineScreen',
      params: { currentStep: 0 },
    });
  };


  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: `${baseURL}images/pausesActives/${encodeURIComponent(program.image)}` }}
        style={styles.fullImage}
        resizeMode="contain"
      />
      {/* Player bottom */}
      <View style={styles.playerContainer}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <Entypo name="controller-play" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.timeTrack}>
          <Text style={styles.timeLabel}>{`${mm}:${ss}`}</Text>
          <View style={styles.trackBackground}>
            <View
              style={[
                styles.trackFill,
                // ici full puisque c'est l'écran avant start
                { width: '100%' },
              ]}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
const BADGE_SIZE = 80;
const PLAYER_HEIGHT = 78;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  fullImage: {
    width: screenWidth,
    height: screenWidth * 1.4,
    marginBottom: 30, borderRadius: 9,
    shadowColor: '#00000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.1,
    elevation: 8,
  },

  playerContainer: {
    height: PLAYER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  playButton: {
    width: 54,
    height: 54,
    borderRadius: 32,
    backgroundColor: '#FFAE00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeTrack: {
    flexDirection: 'row',
    flex: 1,
    marginLeft: 10,
  },
  timeLabel: {
    fontSize: 20,
    fontWeight: '600',
    margin: 2,
    color: '#333',
  },
  trackBackground: {
    width: '80%',
    height: 6,
    margin: 10,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackFill: {
    height: 6,
    backgroundColor: '#FFAE00',
  },
});