import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Platform, PermissionsAndroid, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { useWebRTC } from '@/context/WebRTCContext';
import { RTCView } from 'react-native-webrtc';

const VideoCallScreen = () => {
  const { id: roomId } = useLocalSearchParams();
   const { localStream, remoteStream } = useWebRTC() as {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;

  };

 
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
            zOrder={1}
          />
          
        )}
        {remoteStream && (
          <RTCView
            key={remoteStream._id}
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
            objectFit={'cover'}
            zOrder={0}
          />
        )}
      </View>
      <TouchableOpacity style={{marginBottom: 19, borderRadius: 12, backgroundColor: "#39DF87"}}>
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
