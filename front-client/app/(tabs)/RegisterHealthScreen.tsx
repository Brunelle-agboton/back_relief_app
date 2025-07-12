import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  TextInput, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,   
  Modal,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import BodyMap from '../../components/BodyMap';
import { getUserId } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { PainModal } from '@/components/PainModal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function RegisterHealthScreen() {
  const router = useRouter();
  const [options, setOptions] = useState<string[]>([]);
  const [painLocation, setLocation] = useState('');
  const [painLevel, setLevel] = useState(5);
  const [description, setDescription] = useState('');

  const [painByZone, setPainByZone] = useState<
    Record<string, { level: number; desc: string }>
  >({});
  const [modalZone, setModalZone] = useState<string | null>(null);
  const [tempLevel, setTempLevel] = useState(5);
  const [tempDesc, setTempDesc] = useState('');


  const MuscleSVGs: Record<string, any> = {
    'Tête': require('../../assets/images/muscles/head.svg'), 
    'DroitDuDos': require('../../assets/images/muscles/Grand-dorsal-droit.svg'), 
    'GaucheDuDos': require('../../assets/images/muscles/head.svg'), 
    // 'Épaule gauche': require('../../assets/images/muscles/head.svg'), 
    // 'Épaule droit': require('../../assets/images/muscles/head.svg'), 

    // … etc.
  }; 

  useEffect(() => {
    api.get('/health/pain-options').then(res => setOptions(res.data));
  }, []);

   // Fonction pour interpoler la couleur
   const getColor = (value: number) => {
    const red = Math.round((10 - value) * 25.5); // Diminue le rouge
    const green = Math.round(value * 25.5); // Augmente le vert
    return `rgb(${red}, ${green}, 0)`; // Couleur entre rouge et vert
  };

  const submit = async () => {
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
  };
  

  // ouvre le modal au clic d’une zone
  const handleSelect = (zone: string) => {
    const existing = painByZone[zone] || { level: 5, desc: '' };
    setTempLevel(existing.level);
    setTempDesc(existing.desc);
    setModalZone(zone);
  };

  const saveZone = () => {
    if (modalZone) {
      setPainByZone(z => ({
        ...z,
        [modalZone]: { level: tempLevel, desc: tempDesc },
      }));
      setModalZone(null);
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

      <Text style={styles.subtitle}>Où avez-vous mal ?</Text>
      
      <View style={styles.bodyMapContainer}>        
        <BodyMap 
        onSelect={handleSelect} 
        pains={painByZone}
        />
      </View>
      {/* Modal de saisie EVA + description */}
      <PainModal
        visible={modalZone !== null}
        zone={modalZone!}
        SvgPreview={MuscleSVGs[modalZone!]}
        level={tempLevel}
        desc={tempDesc}
        onChangeLevel={() => setTempLevel}
        onChangeDesc={() => setTempDesc}
        onClose={() => setModalZone(null)}
        onSave={saveZone}
      /* … etc … */
      />
      {/* Affichage résumé */}
      <View style={styles.summary}>
        {Object.entries(painByZone).map(([zone, { level }]) => (
          <Text key={zone}>
            {zone} — {level}/10
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 30,
  },
  bodyMapContainer: {
    width: '100%',
    height: 400,
    marginBottom: 0,
    flexDirection: 'row',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontFamily: 'Regular',
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 4,
    paddingHorizontal: 16,
  },
  locationText: {
    fontFamily: 'Regular',
    fontSize: 16,
    marginBottom: 8,
  },
  enterText: {
    fontFamily: 'Regular',
    fontSize: 16,
    paddingTop: 4,
    paddingBottom: 6,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
    minHeight: 100,
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
  painDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginVertical: 30,
    width: 100,
  },
  painLevel: {
    fontSize: 86,
    fontWeight: '700',
    lineHeight: 78,
  },
  painMax: {
    fontSize: 24,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
    marginBottom: 12,
  },
   modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  musclePreview: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: '#f5f5f5',  // optionnel : fond léger
    padding: 8,
    borderRadius: 8,
  },
modalContent: {
    width: '80%', backgroundColor: '#fff',
    borderRadius: 12, padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  modalLabel: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 8,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
    summary: { marginTop: 20 },

});