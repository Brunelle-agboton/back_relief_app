import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  Alert,
  Pressable,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePractitioner } from "@/context/PractitionerContext";


const MyPatientsView = () => {
    const { profile } = usePractitioner(); // expects context to expose existing availabilities
    
    return (
        <SafeAreaView> </SafeAreaView>
    );
};
const MyProfileView = () => {
        const { profile } = usePractitioner(); // expects context to expose existing availabilities
        return (
        <SafeAreaView> </SafeAreaView>
    );
};

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('planning');

  return (
    <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                style={[styles.tab, activeTab === 'planning' && styles.activeTab]}
                onPress={() => setActiveTab('planning')}
                >
                <Text style={[styles.tabText, activeTab === 'planning' && styles.activeTabText]}>Mes patients</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.tab, activeTab === 'availability' && styles.activeTab]}
                onPress={() => setActiveTab('availability')}
                >
                <Text style={[styles.tabText, activeTab === 'availability' && styles.activeTabText]}>Mon profil</Text>
                </TouchableOpacity>
            </View>
            {activeTab === 'planning' ? <MyPatientsView /> : <MyProfileView />}
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F8" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 4,
    borderColor: "#1662A9"
  },
  tabText: {
    color: '#1662A9',
  },
  activeTabText: {
    color: '#1662A9',
    fontWeight: 'bold',

  }
});
export default ProfileScreen;
