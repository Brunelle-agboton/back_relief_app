import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// --- Données Fictives ---
// À remplacer par un appel API dans un useEffect
export const DUMMY_PROS = [
  {
    id: '1',
    name: 'Dr Frizzero Vicenzi Tantely ',
    specialty: 'Kinésithérapeute',
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
    bio: 'Expert en analyse du mouvement et en performance physique.',
    qualifications: ['Master en STAPS, spécialité Kinésiologie'],
    rating: 4.7,
    location: 'Québec,Canada',
    nextAvailability: '26 Septembre, 11:00',
  },
  {
    id: '2',
    name: 'Dr. Bruno Lemaire',
    specialty: 'Ergothérapeute',
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
    bio: 'Approche holistique pour le bien-être du dos et des articulations.',
    qualifications: ['Diplôme d\'Ostéopathe (D.O.)', 'Formation en ostéopathie du sport'],
    rating: 4.8,
    location: 'Lyon, France',
    nextAvailability: 'Demain, 10:00',
  },
  {
    id: '3',
    name: 'Carole Dubois',
    specialty: 'Ergothérapeute',
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
    bio: 'Conseils pour adapter votre poste de travail et prévenir les TMS.',
    qualifications: ['Diplôme d\'État d\'Ergothérapeute'],
    rating: 4.9,
    location: 'Marseille, France',
    nextAvailability: '25 Septembre, 09:00',
  },
  {
    id: '4',
    name: 'David Petit',
    specialty: 'Kinésithérapeute',
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
    bio: 'Expert en analyse du mouvement et en performance physique.',
    qualifications: ['Master en STAPS, spécialité Kinésiologie'],
    rating: 4.7,
    location: 'Bordeaux, France',
    nextAvailability: '26 Septembre, 11:00',
  },
];

const SPECIALTY_COLORS: { [key: string]: string } = {                                                                                                                      
  'Kinésithérapeute': '#CDFBE2',                                                                                                                                             
  'Ostéopathe': '#FFEDCC',                                                                                                                                                 
  'Ergothérapeute': '#C9E8FC',                                                                                                                                             
  'Kinésiologue': '#D4C2F0',                                                                                                                                               
  'Acupuncture': '#FFD9D9',                                                                                                                                                
  'Podologie': '#CCE0FF',                                                                                                                                                  
};

export const DUMMY_SPECIALTIES = [
  { id: '1', name: 'Kinésithérapeute', displayName: 'Kinésithérapie', imageUrl: require('@/assets/images/specialities/kine.png') },
  // { id: '2', name: 'Ostéopathie', imageUrl: require('@/assets/images/specialities/osteo.png') },
  { id: '3', name: 'Ergothérapeute', displayName: 'Ergothérapie', imageUrl: require('@/assets/images/specialities/ergo.png') },
  // { id: '4', name: 'Kinésiologie', imageUrl: require('@/assets/images/specialities/kinesio.png') },
  // { id: '5', name: 'Acupuncture', imageUrl: require('@/assets/images/specialities/acupuncture.png') },
  // { id: '6', name: 'Podologie', imageUrl: require('@/assets/images/specialities/podologie.png') },
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
  location: string;
  nextAvailability: string;
};

const ProCard = ({ item }: { item: Pro }) => {
  const router = useRouter();

  const handlePress = () => {
    // Navigue vers la page de détail du pro en passant son ID
    router.push(`/teleconsultation/pro-details/${item.id}`);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer, 
        { backgroundColor: SPECIALTY_COLORS[item.specialty] || '#FFFFFF' }, // Default to white if specialty not found 
        pressed && styles.cardPressed
        ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Voir le profil de ${item.name}`}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardSpecialty}>{item.specialty}</Text>
      <View style={styles.locationContainer}>
        <MaterialIcons name="location-on" size={14} color="#6C757D" />
        <Text style={styles.cardLocation}>{item.location}</Text>
      </View>
      <Text style={styles.cardAvailability}>A partir du {'\n'}{item.nextAvailability}</Text>
      <Pressable style={styles.bookButton} onPress={handlePress}>
        <Text style={styles.bookButtonText}>Prendre RDV</Text>
      </Pressable>
    </Pressable>
  );
};

// SpecialtyCard Component
type Specialty = {
  id: string;
  name: string;
  displayName: string;
  imageUrl: any; // Use 'any' for require() or define a more specific type if needed
};

type SpecialtyCardProps = {
  item: Specialty;
  onPress: (specialtyName: string) => void;
  isSelected: boolean;
};

const SpecialtyCard = ({ item, onPress, isSelected }: SpecialtyCardProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.specialtyCard,
        isSelected && styles.selectedSpecialtyCard, // Apply selected style
      ]}
      onPress={() => onPress(item.name)}
    >
      <Image source={item.imageUrl} style={styles.specialtyImage} />
      <Text style={styles.specialtyName}>{item.displayName}</Text>
    </TouchableOpacity>
  );
};

// --- Écran Principal ---
export default function ProListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const handleSpecialtyPress = (specialtyName: string) => {
    setSelectedSpecialty(prevSpecialty =>
      prevSpecialty === specialtyName ? null : specialtyName
    );
  };

  const filteredPros = useMemo(() => {
    let prosToFilter = DUMMY_PROS;

    // Apply specialty filter first
    if (selectedSpecialty) {
      prosToFilter = prosToFilter.filter(pro => pro.specialty === selectedSpecialty);
    }

    // Then apply search query filter
    if (searchQuery) {
      prosToFilter = prosToFilter.filter(pro =>
        pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pro.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return prosToFilter;
  }, [searchQuery, selectedSpecialty]);

    return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Trouver un professionnel' }} />
      <FlatList
        data={filteredPros}
        renderItem={({ item }) => <ProCard item={item} />}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Qui souhaitez-vous consulter ?</Text>
              <View style={styles.searchWrapper}>
                <Ionicons name="search" size={20} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchBar}
                  placeholder="Nom du medecin douleur"
                  placeholderTextColor={"#fff"}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                  accessibilityLabel="Rechercher des professionnels"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")} style={styles.clearBtn}>
                    <Ionicons name="close-circle" size={18} />
                  </Pressable>
                )}
              </View>
            </View>

            <View style={styles.specialityView}>
              <Text style={styles.subtitle}>Specialites</Text>
              <FlatList
                data={DUMMY_SPECIALTIES}
                renderItem={({ item }) => (
                  <SpecialtyCard
                    item={item}
                    onPress={handleSpecialtyPress}
                    isSelected={selectedSpecialty === item.name}
                  />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.specialtiesListContent}
              />
            </View>
            <Text style={[styles.subtitle, { paddingHorizontal: 16, paddingVertical: 6,}]}>Nos medecins</Text>
          </>
        )}
      />
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
    title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    paddingTop: 8,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
   searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e4e5e6ff",
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 34,
  }, searchIcon: {
    marginRight: 8,
    color: "#fff",
  },
  clearBtn: {
    marginLeft: 8,
    padding: 4,
  },
  searchBar: {
    height: 34,
    backgroundColor: '#e4e5e6ff',
    borderRadius: 18,
    fontSize: 16,
  },
specialityView: {
  paddingHorizontal: 16,
  paddingVertical: 8,
},
specialtyCard: {
  alignItems: 'center',
  borderWidth:1,
  borderColor: '#EDEDED',
  borderRadius: 10,
    padding: 6,

  marginRight: 12,
  width: 90, // Fixed width for each specialty card
},
  selectedSpecialtyCard: {
    borderColor: '#0e5292ff', // Highlight color for selected specialty
    borderWidth: 2,
  },
specialtyImage: {

  marginBottom: 4,
},
specialtyName: {
  fontSize: 12,
  textAlign: 'center',
  color: '#495057',
},
specialtiesListContent: {
  paddingVertical: 8,
},
  listContent: {
    padding: 16,
  },
  row: {
    flex: 1,
    justifyContent: "space-around",
  },
  cardContainer: {
    borderRadius: 18,
    padding: 16,

    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    width: '48%', // Adjust width for two columns
    marginHorizontal: '1%', // Add horizontal margin
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // Cercle parfait
    marginBottom: 12,
  },
  cardName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSpecialty: {
    fontSize: 11,
    color: '#495057',
    textAlign: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 12,
    color: '#6C757D',
    marginLeft: 4,
  },
  cardAvailability: {
    fontFamily: 'Urbanist',

    fontSize: 12,
    color: '#020202',
    marginBottom: 12,
  },
  bookButton: {
    backgroundColor: '#0e5292ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
