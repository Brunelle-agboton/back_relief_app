import React, { useEffect, useState } from 'react';
 import { 
    View, Text, StyleSheet, Image, ScrollView, Pressable, ActivityIndicator, SafeAreaView } from
       'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
 import { DUMMY_PROS, Pro } from '../pro-list'; // On importe les données pour la simulation
  export default function ProDetailsScreen() {
  const { id } = useLocalSearchParams(); // Récupère l'ID de l'URL
   const router = useRouter();
   const [pro, setPro] = useState<Pro>();
  const [isLoading, setIsLoading] = useState(true);
   useEffect(() => {
    const fetchProData = () => {
      const foundPro = DUMMY_PROS.find(p => p.id === id);
      setPro(foundPro);
      setIsLoading(false);
    };

     fetchProData();
   }, [id]);

   if (isLoading) {
     return <ActivityIndicator size="large" style={styles.centered} />;
   }

   if (!pro) {
     return (
      <View style={styles.centered}>
      <Text>Professionnel non trouvé.</Text>
      </View>
    );
  }
  const handleBookingPress = () => {
    // Navigue vers la page de prise de rdv en passant l'ID du pro
    router.push({
      pathname: '/teleconsultation/book-appointment',
       params: { proId: pro.id, proName: pro.name }
     });
   };

   return (
     <SafeAreaView style={styles.container}>
       <Stack.Screen options={{ title: pro.name }} />
       <ScrollView contentContainerStyle={styles.scrollContent}>
         {/* Section d'en-tête */}
         <View style={styles.headerSection}>
           <Image source={{ uri: pro.imageUrl }} style={styles.profileImage} />
           <Text style={styles.name}>{pro.name}</Text>
           <Text style={styles.specialty}>{pro.specialty}</Text>
           <View style={styles.ratingContainer}>
             <Text style={styles.rating}>0 ★</Text>
           </View>
         </View>
          {/* Section Bio */}
         <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          {/* {pro.bio} */}
          <Text style={styles.bio}></Text>
        </View>
        {/* Section Qualifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diplômes et certifications</Text>
          {pro.qualifications.map((qual, index) => (
            <Text key={index} style={styles.listItem}>• {qual}</Text>
          ))}
        </View>
      </ScrollView>
      {/* Bouton de prise de RDV flottant */}
      <View style={styles.footer}>
        <Pressable style={styles.bookingButton} onPress={handleBookingPress}>
          <Text style={styles.bookingButtonText}>Prendre rendez-vous</Text>
        </Pressable>
      </View>
    </SafeAreaView>
   );
 }

 const styles = StyleSheet.create({
   container: {
     flex: 1,
     backgroundColor: '#FFFFFF',
   },
   centered: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
   },
   scrollContent: {
     paddingBottom: 100, // Espace pour le bouton flottant
   },
   headerSection: {
     alignItems: 'center',
     padding: 24,
     backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
     fontSize: 24,
     fontWeight: 'bold',
     color: '#212529',
   },
   specialty: {
     fontSize: 18,
     color: '#495057',
     marginTop: 4,
   },
   ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  rating: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#343A40',
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  bookingButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookingButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});