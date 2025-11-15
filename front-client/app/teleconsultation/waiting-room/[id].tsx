import React, { useEffect , useRef} from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSocket } from '../../../context/SocketContext';

const WaitingRoomScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const initializedRef = useRef(false);


  useEffect(() => {
    console.log('WaitingRoomScreen useEffect triggered.');
    if (initializedRef.current) return; // ⛔ stop le double call en dev
  initializedRef.current = true;
    console.log(`Socket instance: ${socket ? 'available' : 'not available'}, Connected: ${isConnected}, Room ID: ${id}`);

    if (socket && isConnected && id) {
      console.log(`Attempting to join room: ${id} via socket.emit('joinRoom').`);
      socket.emit('joinRoom', { roomId: id });

      socket.on('call_started', (data: { roomId: string }) => {
        console.log(`Call started for room: ${data.roomId}`);
        if (data.roomId === id) {
          router.replace(`/teleconsultation/video-call/${id}`);
        }
      });

      // Optional: Handle other events like 'room_full', 'call_rejected', etc.

      return () => {
        socket.off('call_started');
        // Optional: Emit 'leave_room' if user navigates away before call starts
      };
    }
  }, [socket, isConnected, id, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>En attente de l'autre participant...</Text>
      {!isConnected && <Text style={styles.errorText}>Connexion au serveur de chat...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#ff0000',
  },
});

export default WaitingRoomScreen;
