import { View, Image, StyleSheet, Dimensions, Text, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 1️⃣ Crée un mapping id → require(image)
const images: Record<string, any> = {
  '0': require('../../assets/images/articles/DangerPositionAssise-1.jpg'),
  '1': require('../../assets/images/articles/DangerPositionAssise-2.jpg'),
  '2': require('../../assets/images/articles/DangerPositionAssise-3.jpg'),
  '3': require('../../assets/images/articles/DangerPositionAssise-4.png'),
  '5': require('../../assets/images/articles/benefice.png'),
};

export default function ArticlePauseActive() {
  const params = useLocalSearchParams();
const id = String(params.article);  // assure-toi que c'est une string

  // 2️⃣ Sélectionne l’image correspondant à l’id
  const imageSource = images[id];

  // 3️⃣ Cas d’erreur si id inconnu
  if (!imageSource) {
    return (
      <View style={styles.center}>
        <Text>Aucun article trouvé pour : {id}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={imageSource}
        style={styles.fullImage}
        resizeMode="contain"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  fullImage: {
    width: screenWidth,
    height: screenWidth * 1.5,
    // marginBottom: 30, 
    marginTop: 39, 
    
    borderRadius: 9,
    shadowColor: '#00000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.1,
  },
 center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});