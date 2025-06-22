import { Tabs, useRouter  } from 'expo-router';
import React, { useState } from 'react';
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
import { IconSymbol } from '@/components/ui/IconSymbol';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';

// Liste des tabs avec leurs informations
const TAB_ITEMS = [
  { name: 'index', title: 'Accueil', icon: 'house.fill' },
  { name: 'RegisterHealthScreen', title: 'Douleur', icon: 'activity' },
  { name: 'pauseActive', title: 'Exercices', icon: 'person-walking' },
  { name: 'statsChart', title: 'Progression', icon: 'linechart' },
  { name: 'mine', title: 'Profile', icon: 'user' }
];

export default function TabLayout() {
  const router = useRouter();           // ← utilise useRouter
  const [menuVisible, setMenuVisible] = useState(false);
  
// Option de menu hors-tabs
const EXTRA_ITEMS = [
  { title: 'Déconnexion', path: '/screens/LogoutScreen' },
];
  // Fonction pour naviguer vers une tab spécifique
  const navigateToTab = (tabName: string) => {
    router.push(`/(tabs)/${tabName}`);
    setMenuVisible(false);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerLeft: () => (
            <Image 
              source={require('../../assets/images/BF.png')} 
              style={{ width: 40, height: 40, marginLeft: 8 }} 
            />
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={{ marginRight: 16 }}
              onPress={() => setMenuVisible(true)}
            >
              <Ionicons name="menu" size={28} color="#222" />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
          tabBarStyle: {
            backgroundColor: '#32CD32',
            borderTopWidth: Platform.OS === 'ios' ? 0.2 : 0,
            borderTopColor: '#e5e5e5',
            height: Platform.OS === 'ios' ? 85 : 75,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#666',
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Inter-SemiBold',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginBottom: -4,
          },
          tabBarHideOnKeyboard: true,
          freezeOnBlur: true,
        }}>
        
        {TAB_ITEMS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color }) => {
                if (tab.icon === 'house.fill') {
                  return <IconSymbol size={28} name={tab.icon} color={color} />;
                } else if (tab.icon === 'activity') {
                  return <Feather name={tab.icon} size={24} color={color} />;
                } else if (tab.icon === 'person-walking') {
                  return <FontAwesome6 name={tab.icon} size={24} color={color} />;
                } else if (tab.icon === 'linechart') {
                  return <AntDesign name={tab.icon} size={24} color={color} />;
                } else {
                  return <FontAwesome6 name={tab.icon} size={24} color={color} />;
                }
              },
            }}
          />
        ))}
      </Tabs>

      {/* Menu contextuel */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            {TAB_ITEMS.map((tab) => (
              <Pressable
                key={tab.name}
                style={styles.menuItem}
                onPress={() => navigateToTab(tab.name)}
              >
                <Text style={styles.menuText}>{tab.title}</Text>
              </Pressable>
            ))}

            {/* Séparateur */}
            <View style={styles.separator} />
            {/* Déconnexion */}
            {EXTRA_ITEMS.map(item => (
              <Pressable
                key={item.title}
                style={styles.menuItem}
                onPress={() => router.push(item.path)}
              >
                <Text style={[styles.menuText, styles.logoutText]}>
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </View>          
        </Pressable>

        
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingRight: 16,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
});