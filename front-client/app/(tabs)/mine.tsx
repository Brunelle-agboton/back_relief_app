import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const userProfile = {
  name: 'Back RELIEF',
  username: '@backrelief',
  avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
  
  achievements: [
    { id: '1', title: '30 jours actifs', icon: FontAwesome5, name: "calendar-alt" },
    { id: '2', title: 'Top Hydratation', icon: FontAwesome5, name: "trophy" },
    { id: '3', title: 'Meilleur suivi', icon: Entypo, name: "grid" }
  ]
};

export default function UserProfileScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/pauseActive')} style={styles.backButton}>
          <Entypo name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() =>{ router.push('/settings/ReminderSettingsScreen')}}
        >
          <MaterialIcons name="settings" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
        <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{userProfile.name}</Text>
        <Text style={styles.username}>{userProfile.username}</Text>
      </View>


      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}
           onPress={() =>{ router.push('/screens/ActivityLogScreen')}}>Voir plus</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.messageButton}>
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Réalisations</Text>
        <View style={styles.achievementsContainer}>
          {userProfile.achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <achievement.icon name={achievement.name} size={24} color="#32CD32" />
              </View>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#000',
    marginBottom: 4,
  },
  username: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  bio: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f5f5f5',
    marginHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f5f5f5',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  followButton: {
    flex: 1,
    backgroundColor: '#32CD32',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  followButtonText: {
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    fontSize: 16,
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  messageButtonText: {
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#000',
    marginBottom: 16,
  },
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementItem: {
    alignItems: 'center',
    flex: 1,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
  },
});