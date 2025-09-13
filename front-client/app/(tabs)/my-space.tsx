import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView,Image } from 'react-native';
import { Divider } from 'react-native-elements'
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import Calendar from '@/assets/images/Consultation/Date.svg';
import Heure from '@/assets/images/Consultation/Heure.svg';
import Localisation  from '@/assets/images/Consultation/Localisation.svg';
import Annuler from '@/assets/images/Consultation/Annuler.svg';
import Appel from '@/assets/images/Consultation/Appel.svg';

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
        { is_meetting ? (
          <View style={styles.section}>
          <Divider color='#fff' width={2} style={{padding: 0, marginTop: 14,}} />
        </View>
        ) : (
        <View>

          <View style={styles.sectionWithMeetig}>
            <View  style={styles.sectionHeader}>
            <View  style={styles.sectionHeader}>
            <Calendar style={{ marginRight: 8,}}/>
            <Text >Lundi 15/09/2025</Text>
            </View>
            <View  style={styles.sectionHeader}>
            <MaterialCommunityIcons name="clock" size={20} color="#1662A9" style={{ marginRight: 6,}} />
            <Text style={{ marginRight: 10,}}>22:00</Text>
            </View>
            
            </View>
            <Divider color='#fff' width={2} style={{padding: 0, marginTop: 14, height: 3}} />

            <View  style={styles.sectionContainer}>
            <View  style={styles.sectionContainerLeft}>
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              <View style={styles.locationContainer}>
                  <Localisation />
                  <Text style={styles.cardLocation}>{item.location}</Text>
                </View>
                {/* {'\n'}{item.nextAvailability} */}
                <Text style={styles.cardAvailability}>Aujourd’hui, -6 h 00</Text>
              </View>
            <View  style={styles.sectionContainerRight}>

              <View style={styles.cardTextContainer}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardSpecialty}>{item.specialty}</Text>
                
                <Text style={styles.cardBio}>Motif:{'\n'}Douleurs lombaires et aux trapèzes</Text>
                </View>
        </View>
            </View>
          </View>

          <View style={styles.meetButton}>
    <TouchableOpacity style={styles.cancelBtn} onPress={() => alert('Rendez-vous annulé')}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialCommunityIcons name="cancel" size={24} color="#ED6A5E"  style={{ marginRight: 10,}} />
        <Text style={{ color: '#ED6A5E', fontWeight: '600', fontSize: 14 }}>Annuler le RDV</Text>
      </View>
    </TouchableOpacity>
     <TouchableOpacity style={styles.startCallBtn}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Appel width={20} style={{ marginRight: 16,}}/>
        <Text style={{ color: '#000', fontWeight: '600', fontSize: 15 }}>Rejoindre l’appel</Text>
      </View>
    </TouchableOpacity>
          </View>
  </View>
        )}
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
    section: {
    marginBottom: 25,
    backgroundColor: '#DADADA',
    borderRadius: 16,
    padding: 10,
    height: 105,
    
  }, sectionWithMeetig: {
    marginBottom: 14,
    backgroundColor: '#CDFBE2',
    borderRadius: 20,
    padding: 10,
    height: 190,
    
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    alignItems: 'center',
    color: '#2c3e50',
  },
  sectionContainer : {
    flexDirection: 'row',
    marginTop: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
 },
   sectionContainerLeft : {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
 },
   sectionContainerRight : {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 12,

    marginBottom: 15,
 },
 cardImage: {
    width: 60,
    height: 60,
    borderRadius: 35, // Cercle parfait
    marginRight: 18,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardName: {
    fontFamily: 'Urbanist',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  cardSpecialty: {
    fontFamily: 'Urbanist',
    fontWeight: 'regular',
    fontSize: 12,
    color: '#000',
    marginTop: 2,
  },
  cardBio: {
    fontSize: 14,
    color: '#000',
    marginTop: 18,
  },
    locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
    cardLocation: {
    fontSize: 12,
    color: '#020202',
    marginLeft: 4,
  },
  cardAvailability: {
    fontFamily: 'Urbanist',
    marginRight: -10,

    fontSize: 11,
    color: '#020202',
    marginBottom: 12,
  },
  buttonShadow: {
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 20,
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
  meetButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    
  },
  cancelBtn: {
    width: '40%',
    borderColor: '#ED6A5E' ,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 8,
paddingVertical: 8,
  },
  startCallBtn: {
    width: '50%',
       backgroundColor: '#CDFBE2',
    borderRadius:16,
    paddingHorizontal: 8,
paddingVertical: 8,
  }
    
  });