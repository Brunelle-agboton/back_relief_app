// filepath: /app/(tabs)/pauseActive/_layout.tsx
import { Stack } from 'expo-router';
import { Tabs } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export const unstable_settings = {
  // désactive complètement le bouton de la tab-bar
  tabBarButton: () => null,
};
export default function settingsLayout() {
  return (
    <Stack>
    <Stack.Screen
        name="settings" options={{headerShown:false}}/>      
      <Stack.Screen name="ReminderSettingsScreen" options={{headerShown:false}}/>
    </Stack>
  );
}