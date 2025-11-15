import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Platform, PermissionsAndroid, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com:3478' },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

const VideoCallScreen = () => {
  const { id: roomId } = useLocalSearchParams();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const { authState, isLoading } = useAuth();
  

  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!isConnected) {
      console.log('Socket not connected, returning...');
      return;
    }

    if (!roomId) {
      console.log('Room ID not found, returning...');
      router.replace('/'); // Redirect if no room ID
      return;
    }

    console.log(`VideoCallScreen: Connected to socket, Room ID: ${roomId}`);

    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
          if (
            granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
          ) {
            return true;
          } else {
            console.log('Permissions denied');
            return false;
          }
        } catch (err) {
          console.warn(err);
          return false;
        }
      }
      return true;
    };

    const setupWebRTC = async () => {
      const permissionsGranted = await requestPermissions();
      if (!permissionsGranted) {
        // Handle permission denial, maybe show a message to the user
        router.replace('/');
        return;
      }

      console.log('Setting up WebRTC...');
      peerConnection.current = new RTCPeerConnection(configuration);

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate', event.candidate);
          socket.emit('ice_candidate', { candidate: event.candidate, roomId });
        }
      };

      peerConnection.current.ontrack = (event: any ) => {
        if (event.streams && event.streams[0]) {
          const inbound = event.streams[0];
    console.log('Remote stream received', inbound);

    setRemoteStream(prev => {
      // Première fois : pas de remote stream → on enregistre
      if (!prev) return inbound;

      // Même stream ID mais nouvelles tracks (audio puis vidéo)
      if (prev._id === inbound._id) {
        // On renvoie inbound pour forcer le rafraîchissement
        return inbound;
      }

      // Nouveau stream (rare mais possible)
      return inbound;
    });
        }
      };

      // Get local media stream
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: { 
            width: 640, 
            height: 480, 
            frameRate: 30,
            facingMode: 'user', // 'user' for front camera, 'environment' for back camera
          },
        });
        setLocalStream(stream);
        stream.getTracks().forEach(track => peerConnection.current!.addTrack(track, stream));
        console.log('Local stream added', stream);
      } catch (error) {
        console.error('Error getting user media:', error);
      }

      // Socket event listeners
      socket.on('offer', async (data: { sdp: any; roomId: string }) => {
        if (data.roomId === roomId) {
          console.log('Received offer', data.sdp);
          await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await peerConnection.current!.createAnswer();
          await peerConnection.current!.setLocalDescription(answer);
          socket.emit('answer', { sdp: answer, roomId });
          console.log('Sent answer', answer);
        }
      });

      socket.on('answer', async (data: { sdp: any; roomId: string }) => {
        if (data.roomId === roomId) {
          console.log('Received answer', data.sdp);
          await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(data.sdp));
        }
      });

      socket.on('ice_candidate', async (data: { candidate: any; roomId: string }) => {
        if (data.roomId === roomId && data.candidate) {
          console.log('Received ICE candidate', data.candidate);
          await peerConnection.current!.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      });

      socket.on('create_offer', async () => {
        console.log('Received create_offer, creating offer...');
        const offer = await peerConnection.current!.createOffer();
        await peerConnection.current!.setLocalDescription(offer);
        socket.emit('offer', { sdp: offer, roomId });
        console.log('Sent offer', offer);
      });

      // Emit a ready event to the server to signal that this client is ready for WebRTC setup
      socket.emit('webrtc_ready', { roomId });
    };

    setupWebRTC();

    return () => {
      console.log('Cleaning up WebRTC...');
      if (localStream) {
        localStream.getTracks().forEach((track: any) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      socket.off('offer');
      socket.off('answer');
      socket.off('ice_candidate');
    };
  }, [socket, isConnected, roomId, router]);

  const handleEndCall = () => {
    if(authState.user?.role === "user") {
          router.replace('/(tabs)');
      } 
      else if(authState.user?.role === "practitioner"){
        router.replace('/(pro)');
      }
  }

  if (!localStream) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Demande d'accès à la caméra/micro...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Appel vidéo en cours - Salle: {roomId}</Text>
      <View style={styles.videoContainer}>
        {localStream && (
          <RTCView
          
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit={'cover'}
            mirror={true}
          />
        )}
        {remoteStream && (
          <RTCView
            key={remoteStream._id}
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
            objectFit={'cover'}
          />
        )}
      </View>
      <TouchableOpacity onPress={handleEndCall} style={{marginBottom: 19, borderRadius: 12, backgroundColor: "#39DF87"}}>
        <Text>End Call</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideo: {
    width: 150,
    height: 200,
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'black',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
});

export default VideoCallScreen;
