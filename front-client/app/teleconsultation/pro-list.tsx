import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, Pressable, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import api from '../../services/api'; // Import the API service
import { SpecialtyCardProps, User, PractitionerProfile, Availability } from '@/interfaces/types';
import { DUMMY_SPECIALTIES } from '@/utils/specialities';

const SPECIALTY_COLORS: { [key: string]: string } = {
  'kinesiologue': '#CDFBE2',
  'physiotherapist': '#FFEDCC',
  'Ergothérapeute': '#C9E8FC',
  'orthopedist': '#fcc9f3ff',
};

// --- ProCard Component (adapted for PractitionerProfile) ---
const ProCard = ({ item }: { item: PractitionerProfile }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/teleconsultation/pro-details/${item.id}`);
  };

  // Determine next availability
  const getNextAvailability = (availabilities: Availability[]) => {
    if (!availabilities || availabilities.length === 0) return 'No availability';
    const now = new Date();
    const futureAvailabilities = availabilities.filter(slot => new Date(slot.startTime) > now && !slot.isBooked);
    if (futureAvailabilities.length === 0) return 'No upcoming availability';

    futureAvailabilities.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const nextSlot = futureAvailabilities[0];
    const nextDate = new Date(nextSlot.startTime);
    return `${nextDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}, ${nextDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const nextAvailabilityText = getNextAvailability(item.availabilities);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        { backgroundColor: SPECIALTY_COLORS[item.professionalType] || '#FFFFFF' },
        pressed && styles.cardPressed
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Voir le profil de ${item.user?.userName}`}
    >
      <Image source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d' }} style={styles.cardImage} /> {/* Placeholder image */}
      <Text style={styles.cardName}>{item.user?.userName}</Text>
      <Text style={styles.cardSpecialty}>{item.professionalType}</Text>
      <View style={styles.locationContainer}>
        <MaterialIcons name="location-on" size={14} color="#6C757D" />
        <Text style={styles.cardLocation}>{`${item.city}, ${item.country}`}</Text>
      </View>
      <View style={{ alignItems: 'center', marginBottom: 8 }}>
        <Text style={[styles.cardAvailability, { fontWeight: '600' }]}>A partir du</Text>
        <Text style={[styles.cardAvailability, { fontWeight: '600', marginTop: -12}]}>{nextAvailabilityText}</Text>
      </View>
      <Pressable style={styles.bookButton} onPress={handlePress}>
        <Text style={styles.bookButtonText}>Prendre RDV</Text>
      </Pressable>
    </Pressable>
  );
};


const SpecialtyCard = ({ item, onPress, isSelected }: SpecialtyCardProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.specialtyCard,
        isSelected && styles.selectedSpecialtyCard,
      ]}
      onPress={() => onPress(item.name)}
    >
      <Image source={item.imageUrl} style={styles.specialtyImage} />
      <Text style={styles.specialtyName}>{item.displayName}</Text>
    </TouchableOpacity>
  );
};

// --- Main Screen Component ---
export default function ProListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [practitioners, setPractitioners] = useState<PractitionerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        const response = await api.get<PractitionerProfile[]>('/practitioner-profile');
        setPractitioners(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch practitioners');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPractitioners();
  }, []);

  const handleSpecialtyPress = (specialtyName: string) => {
    setSelectedSpecialty(prevSpecialty =>
      prevSpecialty === specialtyName ? null : specialtyName
    );
  };

  const filteredPros = useMemo(() => {
    let prosToFilter = practitioners; // Use fetched data

    // Apply specialty filter first
    if (selectedSpecialty) {
      prosToFilter = prosToFilter.filter(pro => pro.professionalType === selectedSpecialty);
    }

    // Then apply search query filter
    if (searchQuery) {
      prosToFilter = prosToFilter.filter(pro =>
        pro.user?.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pro.professionalType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return prosToFilter;
  }, [searchQuery, selectedSpecialty, practitioners]); // Add practitioners to dependency array

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0e5292ff" />
        <Text style={{ marginTop: 10 }}>Loading professionals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={() => { /* Implement retry logic if needed */ }} style={{ marginTop: 10 }}>
          <Text style={{ color: '#0e5292ff' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Trouver un professionnel' }} />
      <FlatList
        data={filteredPros}
        renderItem={({ item }) => <ProCard item={item} />}
        keyExtractor={item => item.id.toString()} // Key extractor needs to be string
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
                data={DUMMY_SPECIALTIES} // Still using DUMMY_SPECIALTIES for the filter UI
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
  centered: { // Added for loading/error states
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { // Added for error states
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    // fontFamily: 'Inter-Bold', // Commented out as font might not be loaded
    fontSize: 20,
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    // fontFamily: 'Inter-Bold', // Commented out as font might not be loaded
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
    flex: 1, // Allow search bar to take available space
    color: '#000', // Ensure text is visible
  },
  specialityView: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  specialtyCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 10,
    padding: 6,
    marginRight: 12,
    width: 90,
  },
  selectedSpecialtyCard: {
    borderColor: '#0e5292ff',
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
    width: '48%',
    marginHorizontal: '1%',
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    // fontFamily: 'Urbanist', // Commented out as font might not be loaded
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
