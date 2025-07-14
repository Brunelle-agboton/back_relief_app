import React, { useEffect, useState } from 'react';
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

type CompletedExercise = {
  id: number;
  title: string;
  image: string;
};

export default function RegisterHealthScreen() {
  const router = useRouter();
  const [options, setOptions] = useState<string[]>([]);
  const [exercises, setExercises] = useState<CompletedExercise[]>([]);
  const [painLocation, setPainLocation] = useState<string | null>(null);
  const [painLevel, setPainLevel] = useState(5);
  const [description, setDescription] = useState('');
  const [painByZone, setPainByZone] = useState<
    Record<string, { level: number; desc: string }>
  >({});
  const [viewSide, setViewSide] = useState<'front'|'back'>('back');

  const swapSide = (direction: 'next'|'prev') => {
    setViewSide(s =>
      direction === 'next'
        ? s === 'front' ? 'back'  : 'front'
        : s === 'front' ? 'back'  : 'front'
    );
  };
  useEffect(() => {
    api.get('/health/pain-options').then(res => setOptions(res.data));

    const healthHistory = async () => {
      try {
        const {data} = await api.get(`/health/pains-latest`);
        console.log(data.exercises);
        setPainByZone(data.lastPainByLocation);
        setExercises(data.exercises);
      }  catch (err) {
        console.error(err);
      }
    };

    healthHistory();
  }, []);
  
  // ouvre le modal au clic d’une zone
  const handleSelect = (zone: string) => {
    const existing = painByZone[zone] || { level: 5, desc: '' };
    setPainLevel(existing.level);
    setDescription(existing.desc);
    setPainLocation(zone);
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

  return (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    {/* 
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 12 }} >
        {(exercises[selectedCategory] || []).map((line) => (
        <TouchableOpacity
          key={line.exercise.id}
          style={styles.exerciseCard}
        onPress={() => {
        setProgramLines([line]);
        router.push({
          pathname: '/(tabs)/pauseActive/ProgramLineScreen', 
          params: { currentStep: 0 }})
      }}
        >
      <Image source={{ uri: `${baseURL}images/pausesActives/${encodeURIComponent(line.exercise.image)}` }} style={styles.cardImage} />
          <View style={styles.pausetats}>
            <View style={styles.statItem}>
                <Foundation name="clock" size={16} color="#666" {...iconProps} />
                <Text style={styles.statText}>{line.duration} seconds</Text>
            </View>
            {line.calories && (
              <View style={styles.statItem}>
              <Feather name="zap" size={16} color="#666" {...iconProps} />
              <Text style={styles.statText}>{line.calories} kcal</Text>
              </View>
          )}
    
      </View>
</TouchableOpacity>
        ))}
          </ScrollView>
    */}

      <Text style={styles.title}>Douleur</Text>      
      <View style={styles.bodyMapContainer}>        
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
        data={exercises}
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
  title: {
    fontFamily: 'Blod',
    fontSize: 30,
    paddingTop: 4,
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