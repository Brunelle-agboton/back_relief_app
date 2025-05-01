import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';

export default function PauseActiveScreen() {
    const navigation = useNavigation();
    
    const [pause, setPause] = useState('');
    const [error, setError] = useState('');
    
    const handlePause = async () => {
        try {
        const response = await api.post('/rest', { pause });
        } catch (e) {
        setError('Erreur lors de la pause');
        }
    };
    
    return (
        <View style={styles.container}>
        <Text style={styles.label}>La pause </Text>
        <Text>MC à toi de jouer</Text>
        {error ? <Text>{error}</Text> : null}
        </View>
    );
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        label: {
            fontSize: 18,
            marginBottom: 10,
        },
    });