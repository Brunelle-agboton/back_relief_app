// filepath: /app/(tabs)/pauseActive/_layout.tsx
import { Stack } from 'expo-router';
import { Tabs } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function PauseActiveLayout() {
  return (
    <Stack>
    <Stack.Screen
        name="pauseActive" options={{headerShown:false}}/>      
      <Stack.Screen name="ProgramDetailScreen" options={{headerShown:false}}/>
      <Stack.Screen name="ProgramLineScreen" options={{headerShown:false}}/>
    </Stack>
  );
}