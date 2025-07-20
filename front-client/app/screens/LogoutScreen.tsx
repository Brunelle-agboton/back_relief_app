import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { removeToken } from '../../utils/storage';

export default function LogoutScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Se déconnecter",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              // Optionnel : appelle un endpoint pour invalider le token côté serveur
              // await api.post('/user/logout');
              
              // Supprime le token localement
              await removeToken();
              
              // Redirige vers l'écran de login (remplace le stack)
              router.replace('/_home');
            } catch (err) {
              console.warn("Erreur lors de la déconnexion", err);
              Alert.alert("Erreur", "Impossible de se déconnecter pour le moment.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Déconnexion</Text>
      <Text style={styles.subtitle}>
        Vous êtes sur le point de vous déconnecter de votre compte BackRelief.
      </Text>
      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Se déconnecter</Text>
        }
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  logoutButton: {
    backgroundColor: '#EF4444',  // rouge
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
