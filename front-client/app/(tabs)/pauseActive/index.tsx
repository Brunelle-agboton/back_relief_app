import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform  } from 'react-native';
import { useNavigation, NavigationProp,useRoute } from '@react-navigation/native';
import api from '../../../services/api';
import Foundation from '@expo/vector-icons/Foundation';
import Feather from '@expo/vector-icons/Feather';
import { ProgramLine, Program, CategorizedPrograms } from '../../../interfaces/types';
import { useRouter } from 'expo-router';
import { setProgramLines } from '../../../utils/ProgramStore';
import { baseURL } from '../../../services/api';

export const options = {
  headerShown: false,
};

export default function PauseActiveScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [programsByCat, setProgramsByCat] = useState<CategorizedPrograms>({});
  const [exercises, setExercises] = useState<{ [key: string]: ProgramLine[] }>({});
  const [error, setError] = useState<string>('');
    
  useEffect(() => {
  (async () => {
    try {
      const { data: programs } = await api.get<Program[]>('/program');
      // Catégoriser les programmes
      const categorized = programs.reduce<CategorizedPrograms>((acc, p) => {
        const lines = p.lines ?? []
        const cat = lines[0]?.exercise?.category ?? 'all'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(p)
        
        if (!acc.all) acc.all = []
        acc.all.push(p)
        return acc
    }, { all: [] } as CategorizedPrograms)

      setProgramsByCat(categorized);
      // Extraire les ProgramLines pour chaque catégorie
    const linesByCat: { [key: string]: ProgramLine[] } = {};
      Object.keys(categorized).forEach(cat => {
        linesByCat[cat] = categorized[cat]
          .flatMap(p => p.lines)
          .filter((line, idx, arr) =>
            arr.findIndex(l => l.exercise.id === line.exercise.id) === idx // éviter les doublons
          );
      });
      setExercises(linesByCat);
    } catch (e) {
      console.error(e);
      setError("Impossible de charger les programmes");
    }
  })();
  }, []);

  const categories = [
      { id: 'all',   name: 'All'   },
      { id: 'mur',   name: 'Mur'   },
      { id: 'assis', name: 'Assis' },
      { id: 'debout',name: 'Debout'},
   ];

  const filteredPrograms = () => {
    console.log(programsByCat[selectedCategory]);
    return programsByCat[selectedCategory] || [];
  };


    const handleCategoryPress = (categoryId: string) => {
        setSelectedCategory(categoryId);
    };

    const iconProps = Platform.select({
    web: {},
    default: {
      onResponderTerminate: undefined,
      onResponderRelease: undefined,
      onStartShouldSetResponder: undefined
    }
    });

    return (
      <ScrollView 
        style={styles.container}>
        <Text style={styles.subtitle}>Soulage ton dos avec les exercices ci-dessous !</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity 
            key={category.id} 
            style={[
              styles.categoryButton,
              category.id === selectedCategory && styles.categoryButtonActive
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Text style={[
              styles.categoryText,
              category.id === selectedCategory && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

        <View style={styles.viewContainer}>
          <Text style={styles.title}>Exercices</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 22 }} >
              {(exercises[selectedCategory] || []).map((line) => (
              <TouchableOpacity
                key={line.exercise.id}
                style={styles.exerciseCard}
              
              >
            <Image source={{ uri: `${baseURL}images/${encodeURIComponent(line.exercise.image)}` }} style={styles.cardImage} />
                <View style={styles.pausetats}>
                  <View style={styles.statItem}>
                      <Foundation name="clock" size={16} color="#666" {...iconProps} />
                      <Text style={styles.statText}>{line.duration} seconds</Text>
                  </View>
                  {line.calories && (
                    <View style={styles.statItem}>
                    <Feather name="zap" size={16} color="#666" {...iconProps} />
                    <Text style={styles.statText}>{line.calories} kcal</Text>
                    </View>
                )}
         
            </View>
             <TouchableOpacity 
            style={styles.startButton}
             onPress={() => {
              setProgramLines([line]);
              router.push({
                pathname: '/(tabs)/pauseActive/ProgramLineScreen', 
                params: { currentStep: 0 }})
            }}>
            <View style={styles.startButton}>
            <Feather name="play" size={16} color="#fff" {...iconProps} />
            <Text style={styles.startButtonText}>Commencer</Text>
          </View>
            </TouchableOpacity>
      </TouchableOpacity>
    ))}
      </ScrollView>
    </View>

    <View style={styles.viewContainer}>
      <Text style={styles.title}>Programme</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={[{ marginBottom: 6 }, styles.container]} >
        {(programsByCat[selectedCategory] || []).map((program) => (
          <TouchableOpacity
            key={program.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/pauseActive/ProgramDetailScreen',
                params: { programId: program.id }
              })
            }
          >
            <Image source={{ uri: `${baseURL}images/${encodeURIComponent(program.image)}` }} style={styles.programImage} />
            <Feather name="play" size={16} color="#ED6A5E" {...iconProps} style={styles.playIcon} />
              
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
    </ScrollView>
    );
    }
    
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  viewContainer: {
    backgroundColor: '#fff',
    padding:10,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 30,
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Regular',
    fontSize: 16,
    paddingTop: 8,
  },
   exerciseCard: {
     width: 300,
    height: 200,
     marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    boxShadow: '0 4px 4px rgba(16, 15, 15, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    backgroundColor: '#fff',
    elevation: 2,
  },
  cardImage:{ width: '100%', height: 150, resizeMode: 'contain', },
  programImage:{ width: '100%', height: 172, resizeMode: 'cover' },
  categoriesContainer: {
    marginVertical: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    color: '#32CD32',
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  categoryButtonActive: {
    color: '#32CD32',
    borderBottomWidth: 2,
    borderBottomColor: '#32CD32',
  },
  categoryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#32CD32',
  },
  categoryTextActive: {
    color: '#32CD32',
  },
  card: {
    width: 100,
    height: 175,
    borderRadius: 16,
     marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContent: {
    padding: 6,
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#000',
    marginBottom: 2,
  },
  pausetats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 0,
    justifyContent: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginLeft: 15,
    padding: 2,
  },
  statText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#32CD32',
    paddingLeft: 6,

  },
  startButton: {
    backgroundColor: '#ED6A5E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    borderRadius: 12,
  },
  startButtonText: {
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    fontSize: 16,
  },
  activePauseSection: {
    gap: 24,
  },
  sectionTitle: {
    fontFamily: 'Bold',
    fontSize: 20,
    color: '#000',
    marginBottom: 12,
  },
  playIcon: {
    position: 'absolute',
  bottom: 2,
  right: 2,
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 4,
  elevation: 2
  }
});