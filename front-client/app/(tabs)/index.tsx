import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useAnimatedValue
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getUserId } from '../../context/AuthContext';
import { getToken }              from '../../utils/storage';

const { width } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

const characters = {
  low: require('@/assets/images/char-1-3.png'),
  midLow: require('@/assets/images/char-4-5.png'), 
  midHigh: require('@/assets/images/char-6-7.png'), 
  high: require('@/assets/images/char-8-10.png'),   
};

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Ces valeurs viendront de votre API ou storage
  const [painLevel, setPainLevel] = useState<number>();
  const [nbExercises, setNbExercises] = useState<number>();
  const [avgExercises, setAvgExercises] = useState<number>(9);
  const [streakDays, setStreakDays] = useState<number>();

  // Cette fonction fetch les données
  const loadStats = useCallback(async () => {
    if (isAuthenticated) {
      return <Redirect href="/_home" />;
    }
    try 
      {
        const { data } = await api.get('/summary/details');
        setPainLevel(data.painLevel);
        setNbExercises(data.nbExercises);
        setStreakDays(data.streakDays);
      } catch (err) {
        console.error(err);
      }
  }, []);

  // useFocusEffect appelle loadStats à chaque fois que l'écran gagne le focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );    
          
  // Choix du perso selon la douleur
  const pickCharacter = (level: number) => {
    if (level <= 3) return characters.low;
    if (level <= 5) return characters.midLow;
    if (level <= 7) return characters.midHigh;
    return characters.high;
  };

  // Couleur du chiffre (rouge→vert)
  const getColor = (value: number) => {
    const red = Math.round((10 - value) * 25.5);
    const green = Math.round(value * 25.5);
    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <View style={styles.container}>
      {/* En‑tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Aujourd’hui</Text>
      </View>

      {/* Personnage + score */}
      <View style={styles.characterContainer}>
          {/* <View style={{ width: 50, height: 20, backgroundColor: '#000', opacity: 0.5, borderRadius: 25,transform: [{ scaleX: 2 }, { scaleY: 0.5 }], }} /> */}
        <MaterialCommunityIcons name="ellipse" size={79} color="#D9D9D9" style={styles.ellipse} />
        
        <Image
          source={pickCharacter(painLevel ?? 0)}
          style={styles.character}
          resizeMode="contain"
        />
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: getColor(painLevel ?? 0) }]}>
            {painLevel}
          </Text>
          <Text style={styles.scoreMax}>/10</Text>
        </View>
      </View>

      {/* Statuts */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statHydro]}>
          <Image
            source={require('@/assets/images/hydra.png')}
            style={styles.statIcon}
          />
        </View>
        <View style={[styles.statCard, { borderColor:'#32CD32',}]}>
          <Text style={styles.statValue}>{nbExercises}</Text>
          <Text style={styles.statLabel}>exercices</Text>
        </View>
        <View style={[styles.statCard, { borderColor:'#FFAE00',}]}>
          <Text style={[styles.statValue, { color: '#ccc' }]}>
            {streakDays}
          </Text>
          <Text style={[styles.statLabel, { color: '#ccc' }]}>
            jours consécutifs
          </Text>
        </View>
      </View>

      {/* Bouton */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/pauseActive')}
      >
        <Text style={styles.buttonText}>Accéder aux exercices</Text>
        <MaterialCommunityIcons 
            name="chevron-triple-right" 
            size={32} 
            style={styles.icon}
          />
          
      </TouchableOpacity>
    </View>
  );
}

const CARD_SIZE = (width - 40 - 30) / 4; // 20px padding + 10px gaps
const CHAR_SIZE = screenWidth * 0.6;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: { marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '700', color: '#000' },

  characterContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  character: {
    width: width * 0.6,
    height: width * 0.6,
    left: '15%',
    marginBottom: 39,
  },
  ellipse: {
    position: 'absolute',
    bottom: 20,                // décalé vers le bas
     left: '48%',
    width: 100,
    height: 57,
    transform: [{ scaleX: 2 }, { scaleY: 0.5 }],
   
  },
  scoreContainer: {
    position: 'absolute',
    left: 20,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 98,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  statCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statHydro: {
    borderColor:'#9BD9FF',
    backgroundColor: '#e0f7ff',
  },
  statIcon: {
    width: CARD_SIZE * 0.5,
    height: CARD_SIZE * 0.5,
    tintColor: '#0099cc',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },

  button: {
    flexDirection: 'row',
    backgroundColor: '#FF6B61',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },  icon: {
    marginLeft: 5,
    width: 40,
    color: '#fff',
  },
});
