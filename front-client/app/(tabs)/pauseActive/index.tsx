import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native';
import api from '../../../services/api';
import Foundation from '@expo/vector-icons/Foundation';
import Feather from '@expo/vector-icons/Feather';
import { ProgramLine, Program, CategorizedPrograms } from '../../../interfaces/types';
import { useRouter } from 'expo-router';
import { setProgramLines } from '../../../utils/ProgramStore';
import { baseURL } from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const options = {
  headerShown: false,
};
const FAV_KEY = '@fav_exercises';
const FAV_PROGRAMS_KEY = '@fav_programs';

export default function PauseActiveScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [programsByCat, setProgramsByCat] = useState<CategorizedPrograms>({});
  const [exercises, setExercises] = useState<{ [key: string]: ProgramLine[] }>({});
  const [favIds, setFavIds] = useState<number[]>([]);
  const [favExercises, setFavExercises] = useState<ProgramLine[]>([]);
  const [isFavProgram, setIsFavProgram] = useState(false);

  const [error, setError] = useState<string>('');

  const [favProgramIds, setFavProgramIds] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(FAV_PROGRAMS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setFavProgramIds(Array.isArray(parsed) ? parsed : []);
    })();
  }, []);


  useEffect(() => {
    (async () => {
      // 1️⃣ charger les favoris (juste les IDs)
      const raw = await AsyncStorage.getItem(FAV_KEY);
      let list: number[] = [];
      try {
        const parsed = raw ? JSON.parse(raw) : [];
        list = Array.isArray(parsed) ? parsed : [];
      } catch {
        list = [];
      }
      setFavIds(list);
    })();

  }, []);

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

        // 3) extrait les ProgramLine favorites
        const allLines = Object.values(exercises).flat();
        const favLines = allLines.filter(line =>
          favIds.includes(Number(line.exercise.id))
        );
        // Dédupliquer par exercise.id
        const unique = Array.from(
          favLines.reduce((map, line) => map.set(line.exercise.id, line), new Map())
            .values()
        );

        setFavExercises(unique);
      } catch (e) {
        console.error(e);
        setError("Impossible de charger les programmes");
      }
    })();
  }, [favIds, exercises]);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'mur', name: 'Mur' },
    { id: 'assis', name: 'Assis' },
    { id: 'debout', name: 'Debout' },
  ];

  const filteredPrograms = () => {
    // console.log(programsByCat[selectedCategory]);
    return programsByCat[selectedCategory] || [];
  };
  const favPrograms = filteredPrograms().filter(p => favProgramIds.includes(p.id));


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
          style={{ marginBottom: 12 }} >
          {(exercises[selectedCategory] || []).map((line) => (
            <TouchableOpacity
              key={line.exercise.id}
              style={styles.exerciseCard}
              onPress={() => {
                setProgramLines([line]);
                router.push({
                  pathname: '/(tabs)/pauseActive/ProgramLineScreen',
                  params: { currentStep: 0 }
                })
              }}
            >
              <Image source={{ uri: `${baseURL}images/pausesActives/${encodeURIComponent(line.exercise.image)}` }} style={styles.cardImage} />
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.viewContainer}>
        <Text style={styles.title}>Programmes</Text>
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
              <Image source={{ uri: `${baseURL}images/pausesActives/${encodeURIComponent(program.image)}` }} style={styles.programImage} />

            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {favExercises.length > 0 && (
        <View style={styles.viewContainer}>
          <Text style={styles.title}>Exercices favoris</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {favExercises.map(line => (
              <TouchableOpacity
                key={line.exercise.id}
                style={styles.exerciseCard}
                onPress={() => {
                  setProgramLines([line]);
                  router.push({
                    pathname: '/(tabs)/pauseActive/ProgramLineScreen',
                    params: { currentStep: 0 },
                  });
                }}
              >
                <Image
                  source={{
                    uri: `${baseURL}images/pausesActives/${encodeURIComponent(
                      line.exercise.image
                    )}`
                  }}
                  style={styles.cardImage}
                />
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
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {favPrograms.length > 0 && (
        <View style={styles.viewContainer}>
          <Text style={styles.title}>Mes Programmes Favoris</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {favPrograms.map(program => (
              <TouchableOpacity
                key={program.id.toString()}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/pauseActive/ProgramDetailScreen',
                    params: { programId: program.id },
                  })
                }
              >
                <Image
                  source={{
                    uri: `${baseURL}images/pausesActives/${encodeURIComponent(
                      program.image
                    )}`,
                  }}
                  style={styles.programImage}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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
    padding: 10,
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
    marginBottom: 8,
    borderTopColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#00000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    backgroundColor: '#fff',
    elevation: 5,
  },
  cardImage: { width: '100%', height: 150, resizeMode: 'contain', },
  programImage: { width: '100%', height: 172, resizeMode: 'contain' },
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
    height: 160,
    borderRadius: 16,
    marginTop: 1,
    marginRight: 12,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    backgroundColor: '#fff',
    elevation: 6,
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