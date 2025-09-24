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
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import NotificationService from '../services/NotificationService';
import BackButton from '../components/BackButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context'; // Importation ajoutée

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
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn("Permission notifications non accordée");
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const settings = await NotificationService.loadSettings();
      if (settings) {
        await NotificationService.scheduleReminders(settings);}
      
      Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content;
        console.log("Notification tapée:", data);
        const type = 'pause';

        if(type === 'pause') {
          router.push('/(tabs)/pauseActive')
        }
      });
    })();

    const sub = Notifications.addNotificationReceivedListener(notification => {
      setLastNotification(notification);
      setTimeout(() => setLastNotification(null), 5000);
    });
    return () => sub.remove();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemeProvider value={ DefaultTheme}>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(patient)" options={{ headerShown: false }} />   
            <Stack.Screen name="(pro)" options={{ headerShown: false }} />   
            <Stack.Screen name="teleconsultation" options={{ headerShown: false }} />
        
            <Stack.Screen name="_home/index" options={{ headerShown: false }} />
            <Stack.Screen name="screens/LogoutScreen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/ActivityLogScreen" options={{ headerShown: false }} />
            {/* <Stack.Screen name="screens/RegisterStep1Screen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/RegisterStep2Screen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/RegisterStep3Screen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/ForgotPasswordScreen" options={{headerShown: false }}/> */}
            <Stack.Screen name="screens/mine" options={{ headerLeft:  () => <BackButton />, headerTitle: 'Compte', headerTitleAlign: 'center', headerStyle: { backgroundColor: '#CDFBE2' }}}/>
            <Stack.Screen 
              name="screens/UserInfos1" 
              options={{
                headerLeft: () => <></>,
                headerTitle: 'Compte', 
                headerTitleAlign: 'center', 
                headerStyle: { backgroundColor: '#CDFBE2' } }}/>
            <Stack.Screen 
              name="screens/UserInfos2" 
              options={{
                headerLeft: () => <></>,
                headerTitle: 'Informations', 
                headerTitleAlign: 'center', headerStyle: { backgroundColor: '#CDFBE2' }}}/>
            <Stack.Screen name="screens/ReminderSettingsScreen" 
              options={{ 
                headerLeft: () => <></>,
                headerTitle: 'Notifications', 
                headerTitleAlign: 'center', 
                headerStyle: { backgroundColor: '#CDFBE2' }}}/>      
            <Stack.Screen 
              name="screens/ArticlePauseActive" 
              options={{ 
                headerLeft:  () => <BackButton />, 
                headerTitle: 'Articles', 
                headerTitleAlign: 'center', 
                headerStyle: { backgroundColor: '#CDFBE2' }
                }}
            />
            <Stack.Screen 
              name="screens/ArticleHydratation" 
              options={{ 
                headerLeft:  () => <BackButton />, 
                headerTitle: 'Articles', 
                headerTitleAlign: 'center', 
                headerStyle: { backgroundColor: '#CDFBE2' }
                }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaView>
  );
}