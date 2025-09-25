import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Divider } from 'react-native-elements';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Calendar from '@/assets/images/Consultation/Date.svg';
import Localisation from '@/assets/images/Consultation/Localisation.svg';
import Appel from '@/assets/images/Consultation/Appel.svg';
import Heure from '@/assets/images/Consultation/Heure.svg';
import Annuler from '@/assets/images/Consultation/Annuler.svg';

// Define the props for the component
interface NextMeetingCardProps {
  isMeeting: boolean;
  date: string;
  time: string;
  item: {
    id: number;
    imageUrl: string;
    location: string;
    name: string;
    specialty: string;
  };
  reason?: string;
  onCancel: () => void;
  
}

const NextMeetingCard: React.FC<NextMeetingCardProps> = ({ isMeeting, date, time, item, reason, onCancel }) => {
  const { socket } = useSocket();
  const router = useRouter();

  const onJoin = () => {
    console.log("Joinning waitng-room ")
    if (socket) {
      console.log("Socket is : ")
      socket.emit('join_room', { roomId: item.id }); // Assuming item.id is the room ID
      router.push(`/teleconsultation/waiting-room/${item.id}`);
    }
     console.log("Joined waitng-room ")
  };
  if (isMeeting) {
    return (
      <View style={styles.section}>
        <Divider color='#fff' width={2} style={{ padding: 0, marginTop: 14 }} />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.sectionWithMeetig}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeader}>
            <Calendar style={{ marginRight: 8 }} />
            <Text>{date}</Text>
          </View>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="clock" size={20} color="#1662A9" style={{ marginRight: 6 }} />
            <Text style={{ marginRight: 10 }}>{time}</Text>
          </View>
        </View>
        <Divider color='#fff' width={2} style={{ padding: 0, marginTop: 14, height: 3 }} />

        <View style={styles.sectionContainer}>
          <View style={styles.sectionContainerLeft}>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <View style={styles.locationContainer}>
              <Localisation />
              <Text style={styles.cardLocation}>{item.location}</Text>
            </View>
            <Text style={styles.cardAvailability}>Aujourd’hui, -6 h 00</Text>
          </View>
          <View style={styles.sectionContainerRight}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardSpecialty}>{item.specialty}</Text>
              <Text style={styles.cardBio}>Motif:{'\n'}{reason}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.meetButton}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="cancel" size={24} color="#ED6A5E" style={{ marginRight: 10 }} />
            <Text style={{ color: '#ED6A5E', fontWeight: '600', fontSize: 14 }}>Annuler le RDV</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.startCallBtn} onPress={onJoin}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Appel width={20} style={{ marginRight: 16 }} />
            <Text style={{ color: '#000', fontWeight: '600', fontSize: 15 }}>Rejoindre l’appel</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default NextMeetingCard;
