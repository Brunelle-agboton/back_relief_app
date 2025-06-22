import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import api from '../../services/api';
import { getUserId } from '../../utils/storage';

type Activity = {
  id: number;
  type: string;
  metadata?: string;
  createdAt: string;
};

type Section = {
  title: string;       // date formatée
  data: Activity[];
};

export default function ActivityLogScreen() {
  const [sections, setSections] = useState<Section[]>([]);
  const [userId, setUserId] = useState<string | null>();

  useEffect(() => {
  (async () => {
      const id = await getUserId(); 
      setUserId(id);

      if (!id) return;

      try {
        const res = await api.get<Activity[]>(`/activity/${id}`);
         if (res) {
          console.log("Activity data :", res.data);

         // Grouper par jour
         const byDay: Record<string, Activity[]> = {};
         res.data.forEach(act => {
           const day = new Date(act.createdAt).toLocaleDateString();
           byDay[day] ||= [];
           byDay[day].push(act);
         });
         const secs: Section[] = Object.entries(byDay)
           .sort((a,b) => (new Date(b[0]).getTime() - new Date(a[0]).getTime()))
           .map(([day, acts]) => ({ title: day, data: acts }));
         setSections(secs);
       }
      } catch (error) {
        console.error(error);
      }
  })();
  }, []);

  const renderItem = ({ item }: { item: Activity }) => {
    let icon;
    let text;
    switch (item.type) {
      case 'pause_started':
        icon = '▶️'; text = 'Pause démarrée';
        break;
      case 'pause_completed':
        icon = '⏹️'; text = 'Pause terminée';
        break;
      case 'water_drunk':
        icon = '💧'; text = 'Verre d’eau bu';
        break;
      default:
        icon = 'ℹ️'; text = item.type;
    }
    // ajouter plus d’info si metadata
    return (
      <View style={styles.item}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.desc}>
          <Text>{text}</Text>
          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      renderSectionHeader={({ section }) => (
        <Text style={styles.header}>{section.title}</Text>
      )}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container:      { padding: 16 },
  header:         { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  item:           { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  icon:           { fontSize: 24, marginRight: 12 },
  desc:           { flex: 1 },
  time:           { fontSize: 12, color: '#666' },
});
