import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import BackButton from '@/components/BackButton';

export default function PauseActiveLayout() {
  return (
    <Stack
      screenOptions={{
        headerLeft:  () => <BackButton />,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#CDFBE2' },
      }}>
      {/* <Stack.Screen
        name="index"
        options={{ title: 'Exercices' }}
      /> */}
      <Stack.Screen name="pro-list" options={{ title: 'Teleconsultation' }}/>
      <Stack.Screen name="pro-details/[id]" options={{ title: 'Rendez-vous' }}/>
    </Stack>
  );
}