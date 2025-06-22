import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Image } from 'react-native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import BodyMap from '../../components/BodyMap';
import { LineChart } from 'react-native-chart-kit';
import api from '../../services/api';
import { Notification, HealthEntry  } from '../../interfaces/types';
import { getUserId } from '../../utils/storage';
import { useRouter } from 'expo-router';
const { width } = Dimensions.get('window');

const SummaryScreen = () => {
    const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('Semaine');
  const [healthHistory, setHealthHistory] = useState<HealthEntry[]>([]);
  const [exercises, setExercises] = useState<Array<{ id: number; name: string; duration: string; calories: number; date: string }>>([]);  
  const [notifications, setNotifications] = useState<Notification[]>([]);
    const [painLocation, setLocation] = useState('');
  
  // Plages temporelles disponibles
  const timeRanges = ['Semaine', 'Mois','Année'] as const;
  type TimeRange = typeof timeRanges[number];
  // Helpers en haut de ton fichier
  const WEEK_DAYS = ['lun','mar','mer','jeu','ven','sam','dim'] as const;
  const MONTHS   = ['jan','fév','mar','avr','mai','juin','juil','aoû','sep','oct','nov','déc'] as const;

  // Fonction pour obtenir la couleur en fonction de l'intensité
  const getColor = (value: any) => {
    const red = Math.round((10 - value) * 25.5);
    const green = Math.round(value * 25.5);
    return `rgb(${red}, ${green}, 0)`;
  };
  
  // Charger les données (simulation)
  useEffect(() => {
    (async () => {
       const userId = await getUserId(); // Récupérez l'ID de l'utilisateur
          if (!userId) {
            alert('Utilisateur non connecté');
            return;
          }

        try {
          console.log(userId);
          const { data } = await api.get('/summary');
        setHealthHistory(data.healthHistory);
        setExercises(data.exercises);
        setNotifications(data.notifications);

        } catch (error: any) {
            console.error('Failed to fetch summary:', {
                status: error.response?.status,
                data:   error.response?.data,
          });
        }
      })();
    }, [selectedRange]);
    

   // Helper pour agréger selon la plage
  const buildChartData = (entries: HealthEntry[], range: TimeRange) => {
  const now = new Date();

  // 1️⃣ filtrage
  let filtered = entries.filter(e => {
    const d = new Date(e.timestamp);
    if (range === 'Semaine') {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 6);
      return d >= weekAgo;
    }
    if (range === 'Mois') {
      const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 3);
      return d >= monthAgo;
    }
    // Année
    const yearAgo = new Date(now); yearAgo.setFullYear(now.getFullYear() - 1);
    return d >= yearAgo;
  });

  // 2️⃣ init des buckets
  let labels: string[] = [];
  if (range === 'Semaine') {
    labels = WEEK_DAYS as unknown as string[];
  } else if (range === 'Mois') {
    labels = ['S1','S2','S3','S4'];
  } else {
    labels = MONTHS as unknown as string[];
  }

  const buckets: Record<string,{ sum:number; count:number }> = {};
  labels.forEach(lbl => { buckets[lbl] = { sum:0, count:0 }; });

  // 3️⃣ remplissage
  filtered.forEach(({ level, timestamp }) => {
    const d = new Date(timestamp);
    let key: string;
    if (range === 'Semaine') {
      const wd = d.toLocaleDateString('fr-FR',{weekday:'short'});
      key = wd.toLowerCase().slice(0,3); // 'lun','mar',...
    } else if (range === 'Mois') {
      // numéro de semaine dans le mois de 1 à 4
      const w = Math.min(3, Math.ceil(d.getDate()/7));
      key = `S${w+1}`; // S1 à S4
    } else {
      const m = d.getMonth(); // 0..11
      key = MONTHS[m];
    }
    if (buckets[key]) {
      buckets[key].sum   += level;
      buckets[key].count += 1;
    }
  });

  // 4️⃣ construction du data[] sans NaN/Infinity
  const data = labels.map(lbl => {
    const { sum, count } = buckets[lbl];
    return count > 0 ? Math.round((sum/count)*10)/10 : 0;
  });

  return { labels, datasets: [{ data }] };
  };

  const filteredEntries = painLocation === 'Toutes'
  ? healthHistory
  : healthHistory.filter(e => e.location === painLocation);

  // Pré-calculer chartData
  const chartData = buildChartData(filteredEntries, selectedRange);

  //Indicatteurs
  const values = chartData.datasets[0].data;
  const avg = (values.reduce((a,b) => a+b, 0)/values.length) || 0;
  const mx  = Math.max(...values, 0);
  const mn  = Math.min(...values, 0);

    const handleAddPain = () => {
    // Navigation vers l'écran d'ajout de douleur
      router.push('/(tabs)/RegisterHealthScreen');
  };
  
  const toggleNotification = (id: any) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? {...notif, active: !notif.active} : notif
    ));
  };

  // Composant SummaryCard
  function SummaryCardVertical({
    label,
    value,
    color,
  }: {
    label: string;
    value: string;
    color: string;
  }) {
    return (
      <View style={[styles.verticalCard, { backgroundColor: color + '33' }]}>
        <Text style={[styles.verticalValue, { color }]}>{value}</Text>
        <Text style={[styles.verticalLabel, { color: color + 'AA' }]}>{label}</Text>
      </View>
    );
  }


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Aujourd’hui</Text>
      </View>
            <Text style={styles.hintText}>
        Touchez la zone douloureuse pour voir le détail
      </Text>
      <View style={[styles.chartSection, { height: 350 }]}>
      <View style={styles.statsContainer}>
        <SummaryCardVertical label="Moyenne" value={avg.toFixed(1)} color="#4ADE80" />
        <SummaryCardVertical label="Maximum" value={mx.toString()} color="#F59E0B" />
        <SummaryCardVertical label="Minimum" value={mn.toString()} color="#EF4444" />
      </View>
        <View style={styles.mapContainer}>
        <BodyMap onSelect={setLocation} />
      </View>
    </View>
            
      {/* Sélecteur de période */}
      <View style={styles.timeRangeContainer}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              selectedRange === range && styles.timeRangeButtonActive
            ]}
            onPress={() => setSelectedRange(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                selectedRange === range && styles.timeRangeTextActive
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
    {/* Graphique d'historique des douleurs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Douleurs</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddPain}
          >
            <AntDesign name="plus" size={18} color="white" />
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
        
      <LineChart
        data={chartData}
        width={width - 32}
        height={220}
        yAxisSuffix="/10"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(76,175,80,${opacity})`,
          labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          style: { borderRadius: 16 },
        }}
        bezier
        style={styles.chart}
      />
    </View>

{/* Section Exercices réalisés */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Exercices réalisés</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>Tout voir</Text>
          </TouchableOpacity>
        </View>
        
        {exercises?.slice(0, 3).map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseIcon}>
              <MaterialCommunityIcons name="run" size={24} color="#32CD32" />
            </View>
            
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <View style={styles.exerciseDetails}>
                <Text style={styles.exerciseDetail}>{exercise.duration}</Text>
                <Text style={styles.exerciseDetail}>{exercise.calories} calories</Text>
              </View>
            </View>
            
            <Text style={styles.exerciseDate}>{exercise.date}</Text>
          </View>
        ))}
      </View>
      
      {/* Section Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes notifications</Text>
        
        {notifications?.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            <View style={styles.notificationTime}>
              <Text style={styles.notificationTimeText}>{notification.time}</Text>
            </View>
            
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <View style={styles.notificationStatus}>
                <View 
                  style={[
                    styles.statusIndicator, 
                    notification.active ? styles.active : styles.inactive
                  ]}
                />
                <Text style={styles.statusText}>
                  {notification.active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.notificationAction}
              onPress={() => toggleNotification(notification.id)}
            >
              <MaterialCommunityIcons 
                name={notification.active ? "bell" : "bell-off"} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#FFAE00',
    borderRadius: 20,
  },
  timeRangeButton: {
    padding: 10,
    borderRadius: 15,
    backgroundColor: 'transparent',
    flex: 1,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#ED6A5E',
  },
  timeRangeText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#32CD32',
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
  viewAllButton: {
    padding: 8,
  },
  viewAllText: {
    color: '#32CD32',
    fontWeight: '500',
  },
  chartContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  chart: {
    borderRadius: 12,
  },
  painSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  exerciseIcon: {
    backgroundColor: '#f8bb54',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  exerciseDetails: {
    flexDirection: 'row',
  },
  exerciseDetail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 15,
  },
  exerciseDate: {
    fontSize: 12,
    color: '#95a5a6',
    fontWeight: '500',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  notificationTime: {
    backgroundColor: '#e8f4ff',
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
  },
  notificationTimeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  active: {
    backgroundColor: '#2ecc71',
  },
  inactive: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  notificationAction: {
    padding: 8,
  },
   painDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginVertical: 30,
    //backgroundColor: '#3283fc'
  },
  hintText: {
  fontSize: 14,
  color: '#666',
  marginBottom: 8,
  textAlign: 'center',
  },
  chartSection: {
    width: '100%',
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,            // ombre Android
    shadowColor: '#000',     // ombre iOS
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginBottom: 16,
  },
  mapContainer: {
    flex: 2,
    marginRight: 12,
  },
  statsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Carte verticale
  verticalCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    marginVertical: 4,
  },
  verticalValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  verticalLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default SummaryScreen;