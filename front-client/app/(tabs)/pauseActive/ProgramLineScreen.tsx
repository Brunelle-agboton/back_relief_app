import React, { useEffect, useState, useLayoutEffect, useCallback, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Text, Animated, Easing, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import api from '../../../services/api';
import { baseURL } from '../../../services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProgramLines, clearProgramLines } from '../../../utils/ProgramStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const FAV_KEY = '@fav_exercises';

export default function ProgramLineScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation<NavigationProp<any>>();
  const router = useRouter();
  const { currentStep } = params;
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const step = parseInt((Array.isArray(currentStep) ? currentStep[0] : currentStep) ?? '0');
  const [stepState, setStep] = useState(step);
  const programLines = getProgramLines();
  const currentLine = programLines[stepState];
  const [isFav, setIsFav] = useState(false);
  const exoId = Number(currentLine?.exercise?.id ?? 0);
  const [remainingSec, setRemainingSec] = useState<number>(currentLine?.duration ?? 60);
  const progress = useRef(new Animated.Value(0)).current;

  // charger l’état du favori au montage
  useEffect(() => {

    (async () => {
      const raw = await AsyncStorage.getItem(FAV_KEY);
      const list: number[] = raw ? JSON.parse(raw) : [];
      setIsFav(list.includes(exoId));

    })();
  }, [exoId]);

  // toggle + persist
  const toggleFav = useCallback(async () => {

    const raw = await AsyncStorage.getItem(FAV_KEY);
    const list: number[] = raw ? JSON.parse(raw) : [];

    const idx = list.indexOf(exoId);

    const nextFav = idx < 0;
    if (nextFav) {
      list.push(exoId);
    } else {
      list.splice(idx, 1);
    }

    await AsyncStorage.setItem(FAV_KEY, JSON.stringify(list));
    setIsFav(nextFav);

  }, [exoId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleFav} style={{ marginRight: 16 }}>
          <FontAwesome
            name={isFav ? 'star' : 'star-o'}
            size={26}
            color={isFav ? '#000' : '#333'}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isFav, toggleFav]);

  if (!currentLine) return null;
  const decrement = () => {
    setRemainingSec(sec => Math.max(15, sec - 15));  // on descend de 15s, pas en-dessous de 15s
  };
  const increment = () => {
    setRemainingSec(sec => sec + 15);               // on monte de 15s
  };

  const startExercise = async () => {
    // reset l’anim
    progress.setValue(0);

    // lance l’anim linéaire sur remainingSec secondes
    Animated.timing(progress, {
      toValue: 1,
      duration: remainingSec * 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

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
      router.replace('/(tabs)/RegisterHealthScreen'); // ou navigation.navigate('EcranDeFin')
    }
  };

  const finishExercise = async () => {
    const exoId = Number(currentLine.exercise.id);
    const order = Number(currentLine.order);
    try {
      await api.post('/activity', {
        type: 'pause_completed',
        metadata: {
          exerciceId: exoId,
          lineOrder: order,
        },
      });
    } catch (err) {
      console.error(err);
    }
    goToNextStep();

  };
  const size = 200;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;

  // 2️⃣ angle en deg : [-90, 270]
  const rotate = progress.interpolate({
    inputRange: [0, 0.5],
    outputRange: ['0deg', '180deg'],
  });

  // calc des offsets initiaux du thumb
  const thumbSize = 16;
  const initTop = size / 2 - radius - thumbSize / 2;
  const initLeft = size / 2 - thumbSize / 2;


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
          source={{ uri: `${baseURL}images/pausesActives/${encodeURIComponent(currentLine.exercise.image)}` }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* TIMER CIRCLE */}
      <View style={{ width: size, height: size }}>
        <CountdownCircleTimer
          key={`${stepState}-${remainingSec}`}
          isPlaying={isStarted}
          duration={remainingSec}
          colors={['#FFAE00', '#F7B801', '#ED6A5E']}
          colorsTime={[
            remainingSec * (2 / 3),
            remainingSec * (1 / 3),
            remainingSec * 0.15,
          ]}
          size={size}
          strokeWidth={strokeWidth}
          onComplete={() => {
            setIsFinished(true);
            return { shouldRepeat: false };
          }}
        >
          {({ remainingTime }) =>
            !isStarted
              ? (
                // Contrôles avant démarrage
                <View style={styles.timerAdjustContainer}>
                  <TouchableOpacity onPress={decrement} style={styles.adjustButton}>
                    <FontAwesome name="chevron-left" size={32} />
                  </TouchableOpacity>

                  <Text style={styles.timerText}>
                    {String(Math.floor(remainingSec / 60)).padStart(2, '0')}:
                    {String(remainingSec % 60).padStart(2, '0')}
                  </Text>

                  <TouchableOpacity onPress={increment} style={styles.adjustButton}>
                    <FontAwesome name="chevron-right" size={32} />
                  </TouchableOpacity>
                </View>
              )
              : (
                // Affiche le countdown quand c'est lancé
                <View style={{ alignItems: 'center', marginHorizontal: 12, marginVertical: 66 }}>
                  <Text style={styles.timerText}>
                    {String(Math.floor(remainingTime / 60)).padStart(2, '0')}:
                    {String(remainingTime % 60).padStart(2, '0')}
                  </Text>
                </View>
              )
          }
        </CountdownCircleTimer>
        {/* 3️⃣ Le thumb animé */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumbContainer,
            {
              width: size,
              height: size,
              transform: [{ rotate }],
            },
          ]}
        >
          <View
            style={[
              styles.thumb,
              {
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
                top: initTop,
                left: initLeft,
              },
            ]}
          />
        </Animated.View>
      </View>
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
            <Text style={styles.actionText}>Terminer l'exercice</Text>
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
    top: 16,
    marginBottom: 8,

  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, paddingLeft: 30, color: '#0a0a8aff', },
  calories: {
    fontSize: 16,
    color: '#0a0a8aff',
    paddingRight: 30,
    marginBottom: 24,
  },
  card: {
    width: '90%',
    height: 200,
    backgroundColor: '#fff',
    marginBottom: 24,
    borderRadius: 10,
    borderTopWidth: 0,
    borderColor: '#eee',
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
  // timer: { fontSize: 36, fontWeight: 'bold', color: '#222' },
  buttonRow: { flexDirection: 'row', marginTop: 32 },
  button: { flex: 1, marginHorizontal: 10, padding: 16, borderRadius: 24, alignItems: 'center' },
  start: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#FFAE00' },
  end: { backgroundColor: '#ED6A5E' },
  buttonText: { color: '#ffff', fontWeight: 'bold', fontSize: 18 },
  favButton: {
    position: 'absolute',
    top: 6,
    right: 16,
    zIndex: 20,
  },
  timer: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    fontSize: 32,
    fontWeight: 'bold',
  },
  thumb: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FFAE00',
  },

  thumbContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  timerContainer: {
    marginBottom: 24,
  },
  timerAdjustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 66,
  },
  adjustButton: {
    padding: 12,
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
    backgroundColor: '#CDFBE2',
  },
  actionText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});