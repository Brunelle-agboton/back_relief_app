import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, Pressable, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';

// --- Données Fictives ---
// À remplacer par un appel API dans un useEffect
export const DUMMY_PROS = [
  {
    id: '1',
    name: 'Dr. Alice Martin',
    specialty: 'Kinésithérapeute',
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
    bio: 'Spécialisée dans les douleurs lombaires et la rééducation posturale.',
    qualifications: ['Diplôme d\'État de Masseur-Kinésithérapeute', 'Spécialisation en thérapie manuelle'],
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Dr. Bruno Lemaire',
    specialty: 'Ostéopathe',
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
    bio: 'Approche holistique pour le bien-être du dos et des articulations.',
    qualifications: ['Diplôme d\'Ostéopathe (D.O.)', 'Formation en ostéopathie du sport'],
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Carole Dubois',
    specialty: 'Ergothérapeute',
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
    bio: 'Conseils pour adapter votre poste de travail et prévenir les TMS.',
    qualifications: ['Diplôme d\'État d\'Ergothérapeute'],
    rating: 4.9,
  },
  {
    id: '4',
    name: 'David Petit',
    specialty: 'Kinésiologue',
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
    bio: 'Expert en analyse du mouvement et en performance physique.',
    qualifications: ['Master en STAPS, spécialité Kinésiologie'],
    rating: 4.7,
  },
];

// --- Composant Carte pour un Professionnel ---
export type Pro = {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  bio: string;
  qualifications: string[];
  rating: number;
};

const ProCard = ({ item }: { item: Pro }) => {
  const router = useRouter();

  const handlePress = () => {
    // Navigue vers la page de détail du pro en passant son ID
    router.push(`/teleconsultation/pro-details/${item.id}`);
  };

  return (
    <Pressable style={styles.cardContainer} onPress={handlePress}>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardSpecialty}>{item.specialty}</Text>
        {/* {item.bio} */}
        <Text style={styles.cardBio}></Text>
      </View>
    </Pressable>
  );
};


// --- Écran Principal ---
export default function ProListScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtre les professionnels en fonction de la recherche
  const filteredPros = useMemo(() => {
    if (!searchQuery) {
      return DUMMY_PROS;
    }
    return DUMMY_PROS.filter(pro =>
      pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Configure le titre de la page dans le header */}
      <Stack.Screen options={{ title: 'Trouver un professionnel' }} />

      <View style={styles.header}>
        <TextInput
          style={styles.searchBar}
          placeholder="Rechercher par nom ou spécialité..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredPros}
        renderItem={({ item }) => <ProCard item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  searchBar: {
    height: 48,
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 35, // Cercle parfait
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  cardSpecialty: {
    fontSize: 16,
    color: '#495057',
    marginTop: 4,
    fontStyle: 'italic',
  },
  cardBio: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 8,
  },
});
