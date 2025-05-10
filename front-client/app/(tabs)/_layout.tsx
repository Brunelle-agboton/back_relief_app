import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: Platform.OS === 'ios' ? 0.2 : 0,
          borderTopColor: '#e5e5e5',
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#32CD32',
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
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name='RegisterHealthScreen'
        options={{
          title: 'Register Health',
          tabBarIcon: ({ color }) => <Feather name="activity" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pauseActive"
        options={{
          title: 'Santé',
          tabBarIcon: ({ color }) => <FontAwesome6 name="person-walking" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="statsChart"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <AntDesign name="linechart" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
      name='mine'
      options={{
        title: 'Mon Compte',
        tabBarIcon: ({ color }) => <FontAwesome6 name="user" size={24} color={color} />,
      }}
      />
    </Tabs>
  );
}
