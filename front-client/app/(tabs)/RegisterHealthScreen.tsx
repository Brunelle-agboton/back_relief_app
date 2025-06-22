import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  TextInput, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,   
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import BodyMap from '../../components/BodyMap';
import { getUserId } from '../../utils/storage';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function RegisterHealthScreen() {
  const router = useRouter();
  const [options, setOptions] = useState<string[]>([]);
  const [painLocation, setLocation] = useState('');
  const [painLevel, setLevel] = useState(5);
  const [description, setDescription] = useState('');

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

  return (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.subtitle}>Où avez-vous mal ?</Text>
      
      <View style={styles.bodyMapContainer}>
        <View style={styles.painDisplay}>
          <Text style={[styles.painLevel, { color: getColor(painLevel) }]}>
            {painLevel}
          </Text>
          <Text style={styles.painMax}>/10</Text>
        </View>
        <BodyMap onSelect={setLocation} />
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.locationText}>
          Localisation de la douleur : {painLocation}
        </Text>

        <Text style={styles.enterText}>Souhaitez-vous décrire la douleur ?</Text>
        <TextInput
          placeholder="Décrivez la douleur"
          multiline
          numberOfLines={4}
          onChangeText={setDescription}
          value={description}
          style={styles.descriptionInput}
        />
        
        <Text style={styles.enterText}>Quelle est l'intensité de cette douleur ?</Text>
        
        <View style={styles.sliderContainer}>
          <Slider
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={painLevel}
            onValueChange={setLevel}
            minimumTrackTintColor={getColor(painLevel)}
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor={getColor(painLevel)}
            style={styles.slider}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>1</Text>
            <Text style={styles.sliderLabel}>10</Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={submit} style={styles.button}>
          <Text style={styles.buttonText}>Envoyer et Accéder aux exercices</Text>
          <MaterialCommunityIcons 
            name="chevron-triple-right" 
            size={24} 
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const TRACK_HEIGHT = 8;
const THUMB_SIZE = Platform.OS === 'ios' ? 30 : 20;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 30,
  },
  bodyMapContainer: {
    width: '100%',
    height: 290,
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
});