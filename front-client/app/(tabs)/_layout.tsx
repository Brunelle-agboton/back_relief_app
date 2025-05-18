import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, Image } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerLeft: () => (
        <Image source={require('../../assets/images/BF.png')} style={{ width: 40, height: 40, marginLeft: 8 }} />
          ),
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Ionicons name="menu" size={28} color="#222" />
            </TouchableOpacity>
          ),
        headerTitleAlign: 'center',
        tabBarStyle: {
          backgroundColor: '#32CD32',
          borderTopWidth: Platform.OS === 'ios' ? 0.2 : 0,
          borderTopColor: '#e5e5e5',
          height: Platform.OS === 'ios' ? 85 : 75,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-SemiBold',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
        // Improve tab bar performance <Ionicons name="water" size={24} color="black" />
        tabBarHideOnKeyboard: true,
        freezeOnBlur: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name='RegisterHealthScreen'
        options={{
          title: 'Douleur',
          tabBarIcon: ({ color }) => <Feather name="activity" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pauseActive"
        options={{
          title: 'Exercices',
          tabBarIcon: ({ color }) => <FontAwesome6 name="person-walking" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="statsChart"
        options={{
          title: 'Progression',
          tabBarIcon: ({ color }) => <AntDesign name="linechart" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
      name='mine'
      options={{
        title: 'Profil',
        tabBarIcon: ({ color }) => <FontAwesome6 name="user" size={24} color={color} />,
      }}
      />
    </Tabs>
  );
}
