import React from "react";
import { Platform, TouchableOpacity, View, Image, Text, StyleSheet } from "react-native";
import { Tabs, Stack, useRouter } from "expo-router";
import { PractitionerProvider } from "@/context/PractitionerContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from '@/components/BackButton';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
const Date= require('@/assets/images/Consultation/Date.svg');

/**
 * ProLayout - améliore le header & tab bar pour ressembler à la maquette
 *
 * Remarques :
 * - Remplace /assets/logo.png par ton logo réel (ou un composant SVG).
 * - Adapte les routes Tab.Screen name="/..." selon la structure de ton app.
 */

const Logo = () => (
  <View style={styles.logoWrap}>
    <Image source={require('@/assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
  </View>
);

const ProLayout = () => {
  const router = useRouter();

  return (
    <PractitionerProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F7F8" }} edges={["top", "left", "right"]}>
        <Tabs
          screenOptions={{
            // TabBar global style
            tabBarActiveTintColor: "#fff",
            tabBarInactiveTintColor: "#7A8A92",
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
            headerTintColor: "#0B2E20",
            // center title exactly
            headerTitleAlign: "center",
            // TabBar container style (rounded, floating)
            tabBarStyle: {
              backgroundColor: "#1662A9",
               borderTopWidth: Platform.OS === 'ios' ? 0.2 : 0,
                height: Platform.OS === 'ios' ? 85 : 75,
                paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            },
            tabBarItemStyle: {
                    borderRadius: 25,
          marginVertical: 4,                    
          padding: 1,  },
            
          }}
        >
          {/* Stack pour l'écran Dashboard (index) */}
          <Tabs.Screen
            name="index"
            options={{
              title: "Votre profil",
              headerLeft: () => <Logo />,
              headerRight: () => (
                              <TouchableOpacity onPress={() => router.push('/screens/mine')} style={{ marginRight: 16 }}>
                                <Ionicons name="person-circle-outline" size={34} color="black" />
                              </TouchableOpacity>
                            ),
              // custom headerLargeTitle style on iOS
              // small "shadow" effect removal to be consistent with design
              headerShadowVisible: false,
              // tab icon
              tabBarIcon: ({ color, focused }) => (
                <View style={styles.tabIconWrap}>
                  <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
                  <Text style={[styles.tabLabel, { color }]}>{/* no label */}</Text>
                </View>
              ),
            }}
          />

          {/* Agenda / Planning */}
          <Tabs.Screen
            name="agenda"
            options={{
              title: "Agenda",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "calendar" : "calendar-outline"} size={22} color={color} />
              ),
              headerShown: false,
            }}
          />
                    {/* Profil */}
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profil",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "folder-sharp" : "folder-outline"} size={22} color={color} />
              ),
            }}
          />

          {/* Messages */}
          <Tabs.Screen
            name="messages"
            options={{
              title: "Messages",
              tabBarIcon: ({ color, focused }) => (
                <MaterialCommunityIcons name={focused ? "message-badge" : "message-badge-outline"} size={22} color={color} />
                
              ),
            }}
          />

        </Tabs>

         
      </SafeAreaView>
    </PractitionerProvider>
  );
};

export default ProLayout;

/* Styles */
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#F6F7F8",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B2E20",
  },
  logoWrap: {
    paddingRight: 8,
    justifyContent: "center",
  },
  logo: {
    width: 110,
    height: 44,
  },
  tabIconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 10,
    marginTop: -16,
  },
});

