import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function MySpace() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, marginTop: 0, justifyContent: 'flex-start' }}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.buttonShadow}
          onPress={() =>
            router.push({
              pathname: '/teleconsultation/pro-list',
              params: { article: 5 },
            })
          }
        >
          <LinearGradient
            colors={['#39df87', '#6ee7b7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Téléconsultation</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.buttonShadow, { marginTop: 28 }]}
          onPress={() => router.push('/content-catalog')}
        >
          <LinearGradient
            colors={['#8fd3f4', '#84e8faff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Articles</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 38,
    paddingHorizontal: 18,
  },
  header: {
    fontSize: 18,
    fontWeight: '500',
    color: '#222',
    textAlign: 'center',
    marginBottom: 18,
  },
  buttonShadow: {
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 20,
  },
  button: {
    height: 95,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});