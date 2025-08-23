import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground,TouchableOpacity } from 'react-native';
import { ContentCard } from '../../components/ContentCard'; 
import { useRouter } from 'expo-router';

export default function Contenu() {
    const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Les bénéfices d’une pause active</Text>
        <View style={[styles.sectionContainer, { marginBottom: 17 }]}>
          <TouchableOpacity
          onPress={() =>
                router.push({
                  pathname: '/screens/ArticlePauseActive', 
                  params: { article: 5 } 
                })
              }
               activeOpacity={0.8}
               >
                <ImageBackground
                  source={require('../../assets/images/contenus/Rectangle_107.png')}
                  style={styles.background}
                  imageStyle={styles.imageRadius}
                >
                  <View style={styles.overlay} />
                  <Text style={styles.title}
                       
                    >Pourquoi prendre des pauses actives ? </Text>
                </ImageBackground>
              </TouchableOpacity>
        </View>

        <View  style={{ marginBottom: 7 }} >
             <Text style={styles.header}>Les dangers de la position assise</Text>
            {Array.from({ length: 4 }).map((_, i) => (
         <View key={i} style={styles.section}>
            <ContentCard
            key={i}
            title='Le savais-tu ?'
            imageSource={require('../../assets/images/contenus/Rectangle_102.png')}
            onPress={() =>
                router.push({
                  pathname: '/screens/ArticlePauseActive', 
                  params: { article: i } 
                })
              }
          />
          </View>
        ))}

        </View>
         <Text style={styles.header}>Hydratation</Text>
        <View style={{ marginBottom: 7 }}>
            <ContentCard
            title='Quelle quantité boire ?'
            imageSource={require('../../assets/images/contenus/Rectangle_109.png')}
            onPress={() =>
                router.push({
                  pathname: '/screens/ArticleHydratation', 
                  params: { article: 109 } 
                })
              }
          />
        </View>
         <View style={{ marginBottom: 7 }}>
            <ContentCard
            title='A quels moments ? '
            imageSource={require('../../assets/images/contenus/Rectangle_110.png')}
            onPress={() =>
                router.push({
                  pathname: '/screens/ArticleHydratation', 
                  params: { article: 110 } 
                })
              }
          />
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionContainer: {
    flex:1,
    height: 115,
    flexDirection: 'row',
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
    section: {
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  }, 
   background: {
      flex: 1,
      alignItems: 'center',
      padding: 34,
    },
    imageRadius: {
      borderRadius: 12,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#000',
      opacity: 0.01,
    },
    title: {
      fontSize: 30,
      fontWeight: '500',
      color:'#E2E2E2',
      lineHeight: 28,  
    },
});
