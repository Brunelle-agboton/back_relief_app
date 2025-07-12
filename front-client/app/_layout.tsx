import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { 
  Platform, 
  TouchableOpacity, 
  Image, 
  Modal, 
  View, 
  Text, 
  StyleSheet,
  Pressable
} from 'react-native';
import { useFonts } from 'expo-font';
import { Stack, Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import NotificationBanner from '../components/NotificationBanner';
import NotificationService from '../services/NotificationService';
import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const router = useRouter();
    const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }

    (async () => {
      // Demande de permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn("Permission notifications non accordée");
        return;
      }

      // Handler pour afficher les notifs en foreground
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });

      // Création du canal Android (sinon pas de notif sur Android ≥8)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const settings = await NotificationService.loadSettings();
      if (settings) {
        await NotificationService.scheduleReminders(settings);}
       // Listener pour le tap sur une notification
      Notifications.addNotificationResponseReceivedListener(response => {
        // Extraire les données custom que tu as passé dans scheduleNotificationAsync
        const data = response.notification.request.content;
        console.log("Notification tapée:", data);
        const type = 'pause';
       // const {type} = data as {type?: string};

        if(type === 'pause') {
          router.push('/(tabs)/pauseActive')
        }
      });
    })();

    // listener pour afficher une bannière en foreground
    const sub = Notifications.addNotificationReceivedListener(notification => {
      setLastNotification(notification);
      // on peut effacer la bannière au bout de 5s, par exemple
      setTimeout(() => setLastNotification(null), 5000);
    });
    return () => sub.remove();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={ DefaultTheme}>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="screens/LoginScreen" options={{ headerShown: false }} />
          <Stack.Screen name="_home/index" options={{ headerShown: false }} />
          <Stack.Screen name="screens/LogoutScreen" options={{ headerShown: false }} />
          <Stack.Screen name="screens/ActivityLogScreen" options={{ headerShown: false }} />
          <Stack.Screen name="screens/RegisterStep1Screen" options={{ headerShown: false }} />
          <Stack.Screen name="screens/RegisterStep2Screen" options={{ headerShown: false }} />
          <Stack.Screen name="screens/RegisterStep3Screen" options={{ headerShown: false }} />
          <Stack.Screen name="screens/ForgotPasswordScreen" options={{headerShown: false }}/>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
            {/* {lastNotification && (
          <NotificationBanner
            message={lastNotification.request.content.body || ''}
          />
        )} */}
      </AuthProvider>

    </ThemeProvider>
  );
}
