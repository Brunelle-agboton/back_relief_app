import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, ScrollView,TouchableOpacity } from 'react-native';
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
      router.push('/(tabs)/pauseActive/pauseActive');
    } else {
      alert('Erreur lors de l\'envoi des données');
    }
    } catch(err) {
        console.error(err);
        alert('Erreur lors de l\'envoi des données');
      }
  };

  return (
    <ScrollView>
      <Text style={styles.subtitle}>Où avez-vous mal ?</Text>
      <View style={{width:'100%', height: 330, marginBottom: 0 }}>
        <BodyMap onSelect={setLocation} />
      </View>
      <Text style={[{ marginBottom: 5 }, styles.enterText]}>Localisation de la douleur : {painLocation}</Text>

      <Text style={styles.enterText}>Souhaitez vous decrire la douleur ?</Text>
      <TextInput
        placeholder="Décrivez la douleur"
        multiline
        numberOfLines={4}
        onChangeText={setDescription}
        value={description}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 5 }}
      />
      
      <Text style={styles.enterText}>Quelle est l’intensité de cette douleur ?{painLevel} / 10</Text>
      <Slider
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={painLevel}
        onValueChange={setLevel}
        minimumTrackTintColor={getColor(painLevel)} // Change la couleur de la piste
        thumbTintColor={getColor(painLevel)} // Change la couleur du curseur
      />
      <TouchableOpacity
        onPress={submit}
        style={styles.button}>
      <Text style={styles.buttonText}>Envoyer et Accéder aux exercices </Text>
      <MaterialCommunityIcons name="chevron-triple-right" size={24} style={styles.icon}/>

        </TouchableOpacity>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectedText: {
    marginBottom: 8,
    fontSize: 16,
  },
  subtitle: {
    fontFamily: 'Regular',
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 8,
  },
   enterText: {
    fontFamily: 'Regular',
    fontSize: 16,
    paddingTop: 8,
  },
  intensityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
  flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginHorizontal: 10, padding: 10, borderRadius: 30,
  backgroundColor: '#ED6A5E' },
  buttonText: {
    color: '#fff',
    fontSize: 15,
  },
  icon: {
    marginLeft: 8,
    width: 84,
    color: '#fff',

  },
});