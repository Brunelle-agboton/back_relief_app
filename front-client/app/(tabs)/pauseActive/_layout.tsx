import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';

export default function PauseActiveLayout() {
  return (
    <Stack
      screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#CDFBE2' },
      }}>
      <Stack.Screen
        name="index"
        options={{ title: 'Exercices' }}
      />
      <Stack.Screen name="ProgramDetailScreen" options={{ title: 'Détails du programme' }}/>
      <Stack.Screen name="ProgramLineScreen" options={{ title: 'Exercice en cours' }}/>
    </Stack>
  );
}