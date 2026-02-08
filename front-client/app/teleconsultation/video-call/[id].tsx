import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Button, Platform, PermissionsAndroid, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { useWebRTC } from "@/context/WebRTCContext";
import { RTCView } from "react-native-webrtc";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const VideoCallScreen = () => {
      const router = useRouter();
  const { id: roomId } = useLocalSearchParams();
    const { socket, isConnected } = useSocket();
     const { authState, isLoading } = useAuth();
   const { localStream, remoteStream } = useWebRTC() as {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;

  };
 
  if (!localStream) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Demande d"accès à la caméra/micro...</Text>
      </View>
    );
  }

  const handleEndCall = () => {
    // Emit leave room event to server
    if (socket && isConnected && roomId ) {
      socket.emit("leaveRoom", { roomId});
    }
    // Clean up local stream
    localStream.getTracks().forEach((track) => track.stop());
    if(authState.user?.role === "user") {
            router.replace("/(tabs)");
        } 
        else if(authState.user?.role === "practitioner"){
          router.replace("/(pro)");
        }
  }


  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {localStream && (
                      <RTCView
          
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit={"cover"}
            mirror={true}
            zOrder={1}
          />
          
        )}
        {remoteStream && (
          <RTCView
            key={remoteStream._id}
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
            objectFit={"cover"}
            zOrder={0}
          />
        )}
      </View>
      <TouchableOpacity onPress={handleEndCall} style={styles.endCallButton}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
        
        <MaterialIcons name="call-end" size={24} color="1662A9" style={{ marginRight: 18 }} />
        <Text style={{ color: "#000", fontWeight: "600", fontSize: 15 }}>Terminer l"appel</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
  },
  videoContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  localVideo: {
    width: 150,
    height: 200,
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: "black",
  },
  remoteVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  endCallButton : {
    width: "50%",
    backgroundColor: "#FF5D5D",
    borderRadius:16,
    paddingHorizontal: 10,
    paddingVertical: 8,
  }
});

export default VideoCallScreen;
