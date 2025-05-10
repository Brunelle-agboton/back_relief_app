import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform  } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import api from '../../services/api';
import Foundation from '@expo/vector-icons/Foundation';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
type Pause = {
  id: string;
  image: string;
  title: string;
  duration: number;
  difficulty?: string;
  calories?: number;
  category?: string;
};

type CategorizedPauses = {
  [key: string]: Pause[];
};

export type RootStackParamList = {
  'screens/PauseDetailScreen': { 
    pauseId: number;
    imageUri: string };

}
export default function PauseActiveScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState('all');
    
    const [pause, setPause] = useState<CategorizedPauses>({});
    const [error, setError] = useState('');
    
    const handlePause = async () => {
        try {
        const response = await api.post('/rest', { pause });
        } catch (e) {
        setError('Erreur lors de la pause');
        }
    };

    useEffect(() => {
        const fetchPause = async () => {
        try {
            const response = await api.get('/rest');
            const pauses = response.data;

            // Organiser les pauses par catégories
            const categorizedPauses = pauses.reduce((acc: Record<string, any[]>, pause: Pause) => {
                const category = pause.category || 'all'; // Utiliser 'all' si aucune catégorie n'est définie
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(pause);
                return acc;
            }, { all: pauses }); // Ajouter toutes les pauses dans la catégorie 'all'

            setPause(categorizedPauses);
        } catch (e) {
            setError('Erreur lors de la récupération de la pause');
        }
        };
        fetchPause();
    }, []);

    const categories = [
    { id: 'all', name: 'All' },
    { id: 'wall', name: 'Wall' },
    { id: 'sit', name: 'Sit' },
    { id: 'standUp', name: 'Stand Up' },
    ];

    const handleCategoryPress = (categoryId: string) => {
        setSelectedCategory(categoryId);
    };
    const getFilteredPause = (): Array<Pause> => {
    if (selectedCategory === 'all') {
      return pause.all || [];
    }
    return pause[selectedCategory] || [];
    };
    const iconProps = Platform.select({
    web: {},
    default: {
      onResponderTerminate: undefined,
      onResponderRelease: undefined,
      onStartShouldSetResponder: undefined
    }
    });

    const renderPauseCard = (pause: { id: string; image: string; title: string; duration: number; difficulty?: string; calories?: number }, iconProps: any) => (
        <TouchableOpacity key={pause.id} style={styles.pauseCard}>
        <Image source={{ uri: `http://localhost:3000/images/${encodeURIComponent(pause.image)}` }} style={styles.pauseImage} />
        <View style={styles.pauseContent}>
            <Text style={styles.pauseTitle}>{pause.title}</Text>
            
            <View style={styles.pausetats}>
            <View style={styles.statItem}>
                <Foundation name="clock" size={16} color="#666" {...iconProps} />
                <Text style={styles.statText}>{pause.duration} seconds</Text>
            </View>
            
            {pause.difficulty && (
                <View style={styles.statItem}>
                <FontAwesome6 name="dumbbell" size={16} color="#666" {...iconProps} />
                <Text style={styles.statText}>{pause.difficulty}</Text>
                </View>
            )}
            
            {pause.calories && (
                <View style={styles.statItem}>
                <Feather name="zap" size={16} color="#666" {...iconProps} />
                <Text style={styles.statText}>{pause.calories} kcal</Text>
                </View>
            )}
            </View>

            <TouchableOpacity 
            style={styles.startButton}
            onPress={() =>
            navigation.navigate('screens/PauseDetailScreen', {
                pauseId: parseInt(pause.id),
                imageUri: `http://localhost:3000/images/${encodeURIComponent(pause.image)}`,
            })
            }
            >
            <Feather name="play" size={16} color="#666" {...iconProps} />

            <Text style={styles.startButtonText}>Start pause</Text>
            </TouchableOpacity>
        </View>
        </TouchableOpacity>
    );
    
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Paus'Active</Text>
        <Text style={styles.subtitle}>Choose your pause for today</Text>
      </View>

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

    <View style={styles.pauseGrid}>
          {getFilteredPause().map(pause => renderPauseCard(pause, iconProps))}
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
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
  },
  categoriesContainer: {
    marginVertical: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  categoryButtonActive: {
    backgroundColor: '#32CD32',
  },
  categoryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  pauseGrid: {
    padding: 20,
    gap: 20,
  },
  pauseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
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
  pauseImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  pauseContent: {
    padding: 16,
  },
  pauseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#000',
    marginBottom: 12,
  },
  pausetats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#32CD32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    fontSize: 16,
  },
  activePauseSection: {
    gap: 24,
  },
  documentsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#000',
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#32CD32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    fontSize: 16,
  },
  documentsList: {
    gap: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    gap: 12,
  },
  documentTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#000',
  },
  hourlyExercises: {
    gap: 16,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    gap: 12,
  },
  exerciseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#000',
  },
  exerciseDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
});