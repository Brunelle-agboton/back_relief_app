import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';

export default function PatientLayout() { 
  return (
    <Stack
      screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#CDFBE2' },
      }}>
      {/* <Stack.Screen
        name="index"
        options={{ title: 'Exercices' }}
      /> */}
      <Stack.Screen name="content-catalog" options={{headerBackVisible: false, title: 'Articles' }}/> 
      <Stack.Screen name="history" options={{ title: 'History' }}/> 
     <Stack.Screen name="profile" options={{ title: 'Mon Profil' }}/>
    </Stack>
  );
}