import React, { useMemo, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  Button, 
  TextInput, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,   
  FlatList,
  Image,
  Platform,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import BodyMapBack from '../../components/BodyMapBack';
import BodyMapFront from '../../components/BodyMapFront';
import { getUserId } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { PainModal } from '@/components/PainModal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MuscleSVGs, MuscleNames } from '@/utils/musclesData';
import { baseURL } from '../../services/api';
import HydrationSelector from '@/components/HydrationBar';

type CompletedExercise = {
  id: number;
  title: string;
  image: string;
};

export default function RegisterHealthScreen() {
  const router = useRouter();
  const [exercises, setExercises] = useState<CompletedExercise[]>([]);
  const [painLocation, setPainLocation] = useState<string | null>(null);
  const [painLevel, setPainLevel] = useState(5);
  const [description, setDescription] = useState('');
  const [painByZone, setPainByZone] = useState<
    Record<string, { level: number; desc: string }>
  >({});
  const [viewSide, setViewSide] = useState<'front'|'back'>('back');
  const [selectedBottle, setSelectedBottle] = useState<string | null>(null);
  const [hydrationHistory, setHydrationHistory] = useState<string>();

  const swapSide = (direction: 'next'|'prev') => {
    setViewSide(s =>
      direction === 'next'
        ? s === 'front' ? 'back'  : 'front'
        : s === 'front' ? 'back'  : 'front'
    );
  };

 const loadHealthData = async () => {
    try {
      const [{ data: painData }, { data: hydraData }] = await Promise.all([
        api.get('/health/pains-latest'),
        api.get<{ history: string }>('/health/hydration-latest'),
      ]);
      setPainByZone(painData.lastPainByLocation);
      setExercises(painData.exercises);
      setHydrationHistory(hydraData.history);
    } catch (err) {
      console.error(err);
    }
  };

  // au focus de l'écran, relance le fetch
  useFocusEffect(
    useCallback(() => {
      loadHealthData();
    }, [])
  );
  
  // ouvre le modal au clic d’une zone
  const handleSelect = (zone: string) => {
    const existing = painByZone[zone] || { level: 5, desc: '' };
    setPainLevel(existing.level);
    setDescription(existing.desc);
    setPainLocation(zone);
  };

   const handleSelectHydration = async (sizeId: string) => {
    setSelectedBottle(sizeId);
    // on stocke localement pour l'affichage
    setHydrationHistory(sizeId);

    // on appelle l'API pour sauvegarde
    try {
      await api.post('/health/hydration', { size: sizeId });
    } catch (err) {
      console.error('Erreur sauvegarde hydration', err);
    }
  };

  const saveZone =  async () => {
    if (painLocation) {
      setPainByZone(z => ({
        ...z,
        [painLocation]: { level: painLevel, desc: description },
      }));

      try {
        const userId = await getUserId(); // Récupérez l'ID de l'utilisateur
        if (!userId) {
          alert('Utilisateur non connecté');
          return;
        }

        const response = await api.post('/health/pain', { userId, painLocation, painLevel, description });
        if (response.data) {
          router.push('/(tabs)/pauseActive');
        } else {
          alert('Erreur lors de l\'envoi des données');
        }
        } catch(err) {
            console.error(err);
            alert('Erreur lors de l\'envoi des données');
      }

      setPainLocation(null);
    }
  };

    // Calculer une liste unique d’exercices par id
  const uniqueExercises = useMemo(() => {
    const seen = new Set<number>();
    return exercises.filter(ex => {
      if (seen.has(ex.id)) return false;
      seen.add(ex.id);
      return true;
    });
  }, [exercises]);

  return (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
     {/* Hydratation */}
<Text style={[styles.title, {marginBottom: 25}]}>Hydratation</Text>
   <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
       contentContainerStyle={styles.exList}
      style={{ marginBottom: 12 }} >
          <HydrationSelector 
        selectedId={selectedBottle || undefined}
        onSelect={handleSelectHydration} 
    />
          </ScrollView>
      <Text style={styles.title}>Douleur</Text>      
      <View style={styles.bodyMapContainer}>        
        <MaterialCommunityIcons name="ellipse" size={79} color="#D9D9D9" style={styles.ellipse} />        
        <TouchableOpacity
          style={[{marginRight: 29}, styles.arrowButton]}
          onPress={() => swapSide('prev')}
        >
          <AntDesign name="left" size={52} style={styles.arrowStyle} />
        </TouchableOpacity>

        {viewSide === 'front' ? (
          <BodyMapFront onSelect={handleSelect} pains={painByZone} />
        ) : (
          <BodyMapBack  onSelect={handleSelect} pains={painByZone} />
        )}

        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => swapSide('next')}
        >
          <AntDesign name="right" size={52} style={styles.arrowStyle}/>
        </TouchableOpacity>
      </View>

      {/* Modal de saisie EVA + description */}
      {painLocation && MuscleSVGs[painLocation] && (
      <PainModal
        visible={painLocation !== null}
        zone={painLocation!}
        SvgPreview={MuscleSVGs[painLocation!]}
        level={painLevel}
        desc={description}
        onChangeLevel={setPainLevel}
        onChangeDesc={setDescription}
        onClose={() => setPainLocation(null)}
        onSave={saveZone}
      />
     )}

     <Text style={styles.sectionTitle}>Exercices réalisés</Text>
      <FlatList
        data={uniqueExercises}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exList}
        renderItem={({ item }) => (
          <View style={styles.exCard}>
            <Image
              source={{ uri: `${baseURL}images/pausesActives/${encodeURIComponent(item.image)}` }}
              style={styles.exImage}
            />
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: '#fff',
    paddingBottom: 30,
  },
  bodyMapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  arrowButton: {
    padding: 16,
  },
  arrowStyle: {
    width: 52,
    color: '#abababff',
    borderRadius: 30,

  },
   ellipse: {
    position: 'absolute',
    bottom: -8,                // décalé vers le bas
    left: '48%',
    width: 100,
    height: 67,
    transform: [{ scaleX: 4 }, { scaleY: 0.8 }],
  },
  title: {
    fontFamily: 'Blod',
    fontSize: 30,
    paddingTop: 14,
    paddingHorizontal: 12,
  },
  subtitle: {
    fontFamily: 'Regular',
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 4,
    paddingHorizontal: 16,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    height: 30,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 30,
    backgroundColor: '#ED6A5E',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  icon: {
    marginLeft: 5,
    width: 40,
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  exList: {
    paddingLeft: 0,
    paddingRight: 20,
  },
  exCard: {
    width: 300,
    height: 160,
    marginRight: 12,
    marginBottom: 8,
    borderTopColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#00000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    backgroundColor: '#fff',
    elevation: 5,
  },
  exImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  exName: {
    fontSize: 14,
    fontWeight: '600',
    margin: 8,
  },
  exDetail: {
    fontSize: 12,
    color: '#555',
    marginHorizontal: 8,
    marginBottom: 8,
  },
});