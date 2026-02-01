import React, { useEffect , useRef} from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSocket } from '../../../context/SocketContext';
import { useWebRTC } from '@/context/WebRTCContext';

const WaitingRoomScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const webRTCContext = useWebRTC();
  const setupWebRTC = webRTCContext?.setupWebRTC;
  const initializedRef = useRef(false);
  const call_started = useRef(false);


  useEffect(() => {
    console.log('WaitingRoomScreen useEffect triggered.');
    //if (initializedRef.current) return; // ⛔ stop le double call en dev
    
    initializedRef.current = true;
    console.log(`Socket instance: ${socket ? 'available' : 'not available'}, Connected: ${isConnected}, Room ID: ${id}`);

    if (socket && isConnected && id && !call_started.current) {
      console.log(`1 :Attempting to join room: ${id} via socket.emit('joinRoom').`);
      socket.emit('joinRoom', { roomId: id });

      setupWebRTC && setupWebRTC();
      socket.on('call_started', (data: { roomId: string }) => {
        call_started.current = true;
        console.log(`Call started for room: ${data.roomId}`);
          router.replace(`/teleconsultation/video-call/${id}`);
        }
      );

      // Optional: Handle other events like 'room_full', 'call_rejected', etc.

      return () => {
        socket.off('call_started');
        // Optional: Emit 'leave_room' if user navigates away before call starts
      };
    }
    if(socket && isConnected && id && call_started.current) {
      console.log(`2 :Attempting to join room: ${id} via socket.emit('joinRoom').`);

      router.replace(`/teleconsultation/video-call/${id}`);
    }
  }, [socket, isConnected, id, router, setupWebRTC]);

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
