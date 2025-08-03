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
import Fontisto from '@expo/vector-icons/Fontisto';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';

// Liste des tabs avec leurs informations
const TAB_ITEMS = [
  { name: 'index', title: 'Accueil', icon: 'house.fill', path: '/(tabs)/index' },
  { name: 'pauseActive', title: 'Paus\'active', icon: 'person-walking', path: '/(tabs)/pauseActive' },
  { name: 'RegisterHealthScreen', title: 'Douleur', icon: 'plus-a', path: '/(tabs)/RegisterHealthScreen' },
  { name: 'statsChart', title: 'Progression', icon: 'linechart', path: '/(tabs)/statsChart'  },
  { name: 'contenu', title: 'Articles', icon: 'folder-sharp',  path: '/(tabs)/contenu' },
];

export default function TabLayout() {
  const router = useRouter();           // ← utilise useRouter
  const [menuVisible, setMenuVisible] = useState(false);
  const { logout } = useAuth();
  // Fonction pour naviguer vers une tab spécifique
  const navigateToTab = (path: string) => {
    router.push(path);
    setMenuVisible(false);
  };

  return (
    <>
      <Tabs
            screenOptions={({ route }) => {
          const name = route.name as string;

          // headerLeft: logo only on Accueil
          const headerLeft = () =>
            name === 'index'
              ? <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
              : null;

          // headerTitle: per tab
          let headerTitle = '';
          switch (name) {
            case 'index':             headerTitle = 'Votre état actuel'; break;
            case 'pauseActive':       headerTitle = 'Exercices';         break;
            case 'statsChart':        headerTitle = 'Progression';       break;
            case 'contenu':           headerTitle = 'Articles';           break;
            default:                  headerTitle = '';                 break;
          }

          // headerRight: either profile icon or menu
          const headerRight = () =>
            name === 'index'
              ? (
                <TouchableOpacity onPress={() => router.push('/screens/mine')}>
                  <Ionicons name="person-circle-outline" size={34} color="black" style={{ marginRight: 16 }} />
                </TouchableOpacity>
              )
              : (<></>
              );

          return {
            headerLeft,
            headerTitle,
            headerTitleAlign: 'center',
            headerRight,
            headerBackground: () => <View style={styles.headerBg} />,
            tabBarActiveTintColor: '#39DF87',
            tabBarInactiveTintColor: '#fff',
           
             tabBarItemStyle: {
                    borderRadius: 25,
          marginVertical: 6,                    
          padding: 2,                           // padding interne
        },
          tabBarActiveBackgroundColor: '#fff',    // fond blanc quand actif
            tabBarInactiveBackgroundColor: 'transparent',
            tabBarLabelStyle: styles.tabLabel,
            tabBarIconStyle: styles.tabIcon,
            tabBarHideOnKeyboard: true,
            tabBarStyle: styles.tabBar,

            freezeOnBlur: true,
          
            // custom button wrapper
          tabBarButton: props => {
            const { accessibilityState, style, children, onPress,  delayLongPress, testID } = props;
            const focused = accessibilityState?.selected ?? false;
            return (
              <TouchableOpacity
                onPress={onPress}
                testID={testID}
                activeOpacity={0.7}
                style={[
                  styles.tabButton,
                  style,
                  focused && styles.tabButtonActive,
                ]}
              >
                {children}
              </TouchableOpacity>
            );
          },
          };
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
                }  else if (tab.icon === 'person-walking') {
                  return <FontAwesome6 name={tab.icon} size={24} color={color} />;
                } else if (tab.icon === 'plus-a') {
                  return <Fontisto name={tab.icon} size={30} color={color} />;
                }else if (tab.icon === 'linechart') {
                  return <AntDesign name={tab.icon} size={24} color={color} />;
                } else if (tab.icon === 'folder-sharp') {
                  return <Ionicons name={tab.icon} size={24} color={color} />;
                }
              },
              ...(tab.name === 'settings' && { headerShown: false }),
              ...(tab.name === 'pauseActive' && { headerShown: false }),
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
                onPress={() => navigateToTab(tab.path)}
              >
                <Text style={styles.menuText}>{tab.title}</Text>
              </Pressable>
            ))}

            {/* Séparateur */}
            <View style={styles.separator} />
            {/* Déconnexion */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={ () => {logout(); 
                  setMenuVisible(false); // ferme le modal 
                }}
              >
                <Text style={[styles.menuText, styles.logoutText]}>
                 Déconnexion
                </Text>
              </TouchableOpacity>
          </View>          
        </Pressable>

        
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
    logo: {
    width: 60, height: 50, marginLeft: 5
  },
  headerBg: {
    flex: 1, backgroundColor: '#CDFBE2'
  },
  tabBar: {
    backgroundColor: '#39DF87',
    borderTopWidth: Platform.OS === 'ios' ? 0.2 : 0,
    height: Platform.OS === 'ios' ? 85 : 75,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  tabLabel: {
    color: "#fff",
    fontSize: 10,
    fontFamily: 'Inter',
    marginTop: 10,
  },
  tabIcon: {
    marginBottom: -4,
  },
    tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    marginVertical: 5,
    padding: 3,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    borderRadius: 25,
  },
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