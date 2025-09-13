import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { 
  Platform, 
  TouchableOpacity, }  from 'react-native';
import { PractitionerProvider } from '@/context/PractitionerContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const ProLayout = () => {
    const router = useRouter();    
  
  return (
    <PractitionerProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Dashboard',
            headerLargeTitle: true,
            headerShadowVisible: false,
            headerRight: () => (
                              <TouchableOpacity onPress={() => router.push('/screens/mine')} style={{ marginRight: 16 }}>
                                <Ionicons name="person-circle-outline" size={34} color="black" />
                              </TouchableOpacity>
                            )
          }}
        />
      </Stack>
    </PractitionerProvider>
  );
};

export default ProLayout;
