import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import BodyMap from '../../components/BodyMap';
import { getUserId } from '../../utils/storage';
import { useRouter } from 'expo-router';


import api from '../../services/api';
import {useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  'pauseActive': undefined;
}

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
      router.push('/pauseActive');
      alert('Données envoyées avec succès');
    } else {
      alert('Erreur lors de l\'envoi des données');
    }
    } catch(err) {
        console.error(err);
        alert('Erreur lors de l\'envoi des données');
      }
  };

  return (
    <View>
      <Text>Où avez-vous mal ?</Text>

      <View style={{ height: 450, marginBottom: 6 }}>
        <BodyMap onSelect={setLocation} />
      </View>
      <Text style={{ marginBottom: 8 }}>Localisation de la douleur : {painLocation}</Text>

      <Text>Souhaitez vous decrire la douleur ?</Text>
      <TextInput
        placeholder="Décrivez la douleur"
        multiline
        numberOfLines={4}
        onChangeText={setDescription}
        value={description}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 16 }}
      />
      
      <Text>Quelle est l’intensité de cette douleur ?{painLevel} / 10</Text>
      <Slider
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={painLevel}
        onValueChange={setLevel}
        minimumTrackTintColor={getColor(painLevel)} // Change la couleur de la piste
        thumbTintColor={getColor(painLevel)} // Change la couleur du curseur
      />

      <Button title="Envoyer" onPress={submit} />
    </View>
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
  bodyMapContainer: {
    height: 300,
    marginBottom: 16,
  },
  selectedText: {
    marginBottom: 8,
    fontSize: 16,
  },
  intensityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});