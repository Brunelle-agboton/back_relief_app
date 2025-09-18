import React, { useState, useMemo } from 'react';
import { View, Pressable, Dimensions, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CalendarList } from "react-native-calendars";
import { formatDate, timeSlots, daysOfWeek } from '@/utils/availabilities';
import api from '@/services/api';

export default function RegisterProStep3Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [error, setError] = useState('');  // { [date: string]: string[] }
  const [availabilities, setAvailabilities] = useState<Record<string, string[]>>({});
  const [selectedDate, setSelectedDate] = useState<string>(formatDate());
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const intervalOptions = [15, 30, 45, 60];
  const interval = 15
    // Marked dates for CalendarList
    const markedDates = useMemo(() => {
      return {
        [selectedDate]: {
          selected: true,
          selectedColor: "#D9FBEA", // mint highlight
          selectedTextColor: "#03694B",
        },
      };
    }, [selectedDate]);

    const renderHourChip = (time: string) => {
        const selected = selectedTimes.includes(time);
        return (
          <Pressable
            key={time}
            onPress={() => {
              setSelectedTimes(prev => 
                selected ? prev.filter(t => t !== time) : [...prev, time]
              );
            }}
            style={[styles.hourChip, selected && styles.hourChipSelected]}
          >
            <Text style={[styles.hourText, selected && styles.hourTextSelected]}>{time}</Text>
          </Pressable>
        );
      };
    

       const handleRegister = async () => {
        const playload = {...params,  availabilities};
          try {
            const res = await api.post('/practitioner-profile', playload);
            
              router.replace('/login');
          } catch (e) {
            setError('Erreur' + e);
          }
        };
  
  return (
    <ScrollView style={styles.container}>
    <Text style={styles.title}>Vos disponibilités</Text>
  {/* Calendar (react-native-calendars) */}
        <View style={styles.calendarWrap}>
          <CalendarList
            horizontal
            pagingEnabled
            calendarWidth={Dimensions.get("window").width - 32}
            pastScrollRange={0}
            futureScrollRange={12}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setSelectedTimes([]);
            }}
            markedDates={markedDates}
            theme={{
              backgroundColor: "#EBF2F3",
              calendarBackground: "#EBF2F3",
              textSectionTitleColor: "#222",
              selectedDayBackgroundColor: "#D9FBEA",
              selectedDayTextColor: "#03694B",
              todayTextColor: "#03694B",
              dayTextColor: "#333",
              textDisabledColor: "#cfcfcf",
              dotColor: "#00adf5",
              arrowColor: "#9AA2A9",
              monthTextColor: "#4A5568",
              textDayFontSize: 12,
              textMonthFontSize: 14,
              textDayHeaderFontSize: 12,
            }}
            style={{ borderRadius: 12 }}
            hideArrows={false}
            showScrollIndicator={false}
          />
        </View>
{/* 
<Text style={styles.sectionTitle}>Intervalle (en minutes)</Text>                                                             
       <View style={styles.intervalContainer}>                                                                                      
        {intervalOptions.map(opt => (                                                                                             
          <TouchableOpacity                                                                                                        
           key={opt}                                                                                                        
           style={[styles.intervalButton, interval === opt && styles.intervalButtonSelected]}                                
             onPress={() => setInterval(opt)}                                                                               
          >                                                                                                                  
           <Text style={[styles.intervalText, interval === opt && styles.intervalTextSelected]}>{opt}</Text>                  
         </TouchableOpacity>                                                                                                     
     ))}                                                                                                                       
   </View>  */}

        {/* Heures */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Creneaux pour le {selectedDate}</Text>

        <View style={styles.hoursWrap}>
          <Text style={styles.subSectionTitle}>Matin</Text>
          <View style={styles.chipsRow}>
            <TouchableOpacity onPress={() => setSelectedTimes(timeSlots)} style={styles.selectAllButton}><Text style={styles.selectAllButtonText}>Tout sélectionner</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedTimes([])} style={styles.selectAllButton}><Text style={styles.selectAllButtonText}>Tout désélectionner</Text></TouchableOpacity>
          </View>
          <View style={styles.chipsRow}>
            {timeSlots.map(renderHourChip)}
          </View>
          <TouchableOpacity
  style={styles.confirmBtn}
  onPress={() => {
    if (selectedTimes.length === 0) return;
    setAvailabilities(prev => {
      const existingTimes = prev[selectedDate] || [];
      const newTimes = selectedTimes.filter(time => !existingTimes.includes(time));
      return {
        ...prev,
        [selectedDate]: [...existingTimes, ...newTimes].sort(),
      };
    });
    setSelectedTimes([]); // reset après ajout
  }}
  disabled={selectedTimes.length === 0}
>
  <Text style={styles.confirmText}>Ajouter les créneaux</Text>
</TouchableOpacity>
        </View>

       
    {error ? <Text style={styles.error}>{error}</Text> : null}
 <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText} onPress={handleRegister}>S'inscrire</Text>
      </TouchableOpacity> 
        </ScrollView>
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  padding: 20,
  // justifyContent: 'center',
  backgroundColor: '#fff',
},
title: {
  fontSize: 24,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 20,
  color: '#333',
},
error: {
  color: 'red',
  marginBottom: 16,
  textAlign: 'center',
},
 button: { 
  marginTop: 20,
  marginBottom: 46,

  padding: 16, 
  alignItems: 'center',
  borderRadius: 28, 
  backgroundColor: '#FF8C00'},
 buttonText: { color: '#ffff', fontWeight: 'bold', fontSize: 18 },
 /* Sections */
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F1724",
    marginBottom: 8,
  },

  calendarWrap: {
    backgroundColor: "#EBF2F3",
    borderRadius: 24,
    padding: 10,
    // drop shadow subtle
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },

  /* Hours */
  hoursWrap: {
    backgroundColor: "#EBF2F3",
    borderRadius: 24,
    padding: 12,
    marginTop: 10,
    // shadow subtle
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  subSectionTitle: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // ios/android newer RN support; fallback with margin
  },
  hourChip: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 8,
  },
  hourChipSelected: {
    backgroundColor: "#DFF3E6",
    borderWidth: 1,
    borderColor: "#07A06B",
  },
  hourText: { color: "#374151" },
  hourTextSelected: { color: "#03694B" },

  /* Confirm */
  confirmBtn: {
    width: '80%',
    marginLeft: 42,

    marginTop: 18,
    backgroundColor: "#DFFCEB",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.8,
  },
  confirmText: { color: "#0B2E20", fontWeight: "700", fontSize: 16 },
    intervalContainer: {                                                                                                             
        flexDirection: 'row',                                                                                                          
        justifyContent: 'center',                                                                                                      
        gap: 10,                                                                                                                       
        marginBottom: 10,                                                                                                              
      },                                                                                                                               
      intervalButton: {                                                                                                                
        paddingHorizontal: 20,                                                                                                         
        paddingVertical: 10,                                                                                                           
        borderRadius: 20,                                                                                                              
        backgroundColor: '#F0F0F0',                                                                                                    
      },                                                                                                                               
      intervalButtonSelected: {                                                                                                        
        backgroundColor: '#FF8C00',                                                                                                    
      },                                                                                                                               
      intervalText: {                                                                                                                  
        color: '#333',                                                                                                                 
        fontWeight: '600',                                                                                                             
      },                                                                                                                               
      intervalTextSelected: {                                                                                                          
        color: '#fff',                                                                                                                 
      },  
      selectAllButton: {
        backgroundColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        margin: 15,
      },
      selectAllButtonText: {
        color: '#333',
      },
});