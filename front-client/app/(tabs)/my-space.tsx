import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView,Image } from 'react-native';
import { Divider } from 'react-native-elements'
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import NextMeetingCard from '@/components/NextMeetingCard';

const item = {
    id: '4',
    name: 'Dr Frizzero Vicenzi Tantely ',
    specialty: 'Kinésithérapeute, physiothérapeute  ',
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
    bio: 'Expert en analyse du mouvement et en performance physique.',
    qualifications: ['Master en STAPS, spécialité Kinésiologie'],
    rating: 4.7,
    location: 'Québec,Canada',
    nextAvailability: '26 Septembre, 11:00',
  };
export default function MySpace() {
  const router = useRouter();
  const is_meetting = false; //true
  return (
    <View style={styles.container}>
      <View style={{ flex: 1, marginTop: 0, justifyContent: 'flex-start' }}>
         <Text style={[styles.subtitle, { paddingHorizontal: 6,  marginBottom: 25,}]}>Mon prochain rendez-vous</Text>
        <NextMeetingCard 
          isMeeting={is_meetting}
          date="Lundi 15/09/2025"
          time="22:00"
          item={item}
          reason="Douleurs lombaires et aux trapèzes"
          onCancel={() => alert('Rendez-vous annulé')}
          onJoin={() => alert('Rejoindre l’appel')}        
        />
         <Text style={[styles.subtitle, { paddingHorizontal: 5,  paddingVertical: 16, marginTop: 20}]}>Consulter</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.buttonShadow}
          onPress={() =>
            router.push({
              pathname: '/teleconsultation/pro-list',
              params: { article: 5 },
            })
          }
        >
          <LinearGradient
            colors={['#39df87', '#6ee7b7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Téléconsultation</Text>
          </LinearGradient>
        </TouchableOpacity>

       <Text style={[styles.subtitle, { paddingHorizontal: 5, marginTop: 20}]}>En savoir plus</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.buttonShadow, { marginTop: 28 }]}
          onPress={() => router.push('/content-catalog')}
        >
          <LinearGradient
            colors={['#8fd3f4', '#84e8faff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Articles</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 18,
    paddingHorizontal: 18,
  },
  header: {
    fontSize: 18,
    fontWeight: '500',
    color: '#222',
    textAlign: 'center',
    marginBottom: 18,
  },
    title: {
    fontFamily: 'Inter-Bold',
    fontSize: 30,
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Urbanist',
    fontWeight: '500',

    fontSize: 16,
    paddingTop: 8,
  },
    button: {
    height: 95,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonShadow: {                                                                                                                                                                 
     borderRadius: 20,                                                                                                                                                            
 shadowColor: '#000000',                                                                                                                                                       
    shadowOffset: { width: 1, height: 3 },                                                                                                                                      
 shadowOpacity: 0.9,                                                                                                                                                           
   shadowRadius: 8,                                                                                                                                                            
 elevation: 20,                                                                                                                                                                
 },          
  });