import { initSentry, Sentry } from '../utils/sentry';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';

initSentry();
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
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import NotificationService from '../services/NotificationService';
import BackButton from '../components/BackButton';


import { SafeAreaView } from 'react-native-safe-area-context'; // Importation ajoutée
import { ThemeProvider, toNavigationTheme, useTheme } from '@/theme';

/**
 * Relaie le thème applicatif vers React Navigation (fonds d'écran, en-têtes,
 * transitions) et vers la barre d'état système.
 *
 * Ce composant est distinct de `RootLayout` parce qu'il doit être *sous* le
 * `ThemeProvider` pour pouvoir appeler `useTheme()`.
 */
function ThemedChrome({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <NavigationThemeProvider value={toNavigationTheme(theme)}>
      {children}
      <StatusBar style={theme.statusBarStyle} />
    </NavigationThemeProvider>
  );
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
    const router = useRouter();
    const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);

  // Les clés doivent correspondre exactement aux familles déclarées dans
  // `theme/tokens/typography.ts`. Lexend est fourni en police variable : les
  // quatre instances statiques en sont extraites, React Native ne sachant pas
  // sélectionner une graisse dans un fichier variable.
  const [loaded] = useFonts({
    'Lexend-Regular': require('../assets/fonts/Lexend-Regular.ttf'),
    'Lexend-Medium': require('../assets/fonts/Lexend-Medium.ttf'),
    'Lexend-SemiBold': require('../assets/fonts/Lexend-SemiBold.ttf'),
    'Lexend-Bold': require('../assets/fonts/Lexend-Bold.ttf'),
    'AtkinsonHyperlegible-Regular': require('../assets/fonts/AtkinsonHyperlegible-Regular.ttf'),
    'AtkinsonHyperlegible-Bold': require('../assets/fonts/AtkinsonHyperlegible-Bold.ttf'),
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
          shouldShowBanner: true,
          shouldShowList: true,
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
    <ErrorBoundary>
    <SafeAreaView style={{ flex: 1 }}>
      <ThemeProvider>
        <ThemedChrome>
        <AuthProvider>
          <SocketProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(patient)" options={{ headerShown: false }} />   
            <Stack.Screen name="(pro)" options={{ headerShown: false }} />

            <Stack.Screen name="_home/index" options={{ headerShown: false }} />
            <Stack.Screen name="screens/LogoutScreen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/ActivityLogScreen" options={{ headerShown: false }} />
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
        </SocketProvider>
        </AuthProvider>
        </ThemedChrome>
      </ThemeProvider>
    </SafeAreaView>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);