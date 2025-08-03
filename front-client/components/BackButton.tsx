import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

export default function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
      <MaterialIcons name="chevron-left" size={44} color="#000" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginLeft: 0,
  },
});
