import React, { useState, useEffect } from 'react';
import { Pressable, View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useAuth } from '../../context/AuthContext';
import { getUserId } from '../../context/AuthContext';

const userProfile = {
  name: 'Back RELIEF',
  username: '@backrelief',
  avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
};

export default function UserProfileScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
        <Text style={styles.username}>{userProfile.username}</Text>
      </View>


      <View style={styles.sectionContainer}>
        <TouchableOpacity style={styles.section} onPress={() => router.push('/screens/UserInfos1')}>
          <View style={styles.exerciseIcon}>
           <FontAwesome5
            name="user-alt"
            size={34}
            color="#CDFBE2"
          />
          </View>      
          <Text style={styles.sectionTitle}>Mon compte</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section} onPress={() => router.push('/screens/UserInfos2')}>
          <View style={styles.exerciseIcon}>
            <MaterialCommunityIcons name="run" size={34} color="#CDFBE2" />
          </View>            
          <Text style={styles.sectionTitle}>Mes Informations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.section} onPress={() => router.push('/screens/ReminderSettingsScreen')}>
          <View style={styles.exerciseIcon}>
           <MaterialCommunityIcons
            name="bell"
            size={34}
            color="#CDFBE2"
          />
          </View>      
          <Text style={styles.sectionTitle}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section} >
          <View style={styles.exerciseIcon}>
            <MaterialCommunityIcons name="file-document-edit" size={34} color="#CDFBE2" />
          </View>            
          <Text style={styles.sectionTitle}>CGV/ Mentions légales</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section} >
          <View style={styles.exerciseIcon}>
            <MaterialCommunityIcons name="shield-lock-open" size={34} color="#CDFBE2" />
          </View>            
          <Text style={styles.sectionTitle}>Politiques de confidentialités</Text>
        </TouchableOpacity>
      </View>
    <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText} onPress={() => logout()}>Se deconnecter</Text>
          </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }, 
   titleContainer: {
    flexDirection: 'row',

    width: '100%',
    paddingHorizontal: 24,
  },
  sectionContainer: {
    width: '100%',
    paddingHorizontal: 24,
  },
  section: {
    flexDirection: 'row',
    marginBottom: 18,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  }, 
  icon: {
    fontSize: 20,
    marginRight: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Urbanist-bold',
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 10,

  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginBottom: 5
  },
  username: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    marginRight: 5,
  },
  
  button: {
    margin: 60,
    paddingHorizontal: 0,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: '#CDFBE2'
  },
  buttonText: { color: '#000', fontSize: 18 },
});