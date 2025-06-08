import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import NotificationService, { ReminderSettings } from '../../services/NotificationService';
import { router, useLocalSearchParams, useRouter } from 'expo-router';

export default function ReminderSettingsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [interval, setInterval] = useState(1);
  const [type, setType] = useState<'pause'|'water'>('pause');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const saved = await NotificationService.loadSettings();
      if (saved) {
        setEnabled(saved.enabled);
        setInterval(saved.intervalHours);
        setType(saved.type);
      }
    })();
  }, []);

  const save = async () => {
   const settings: ReminderSettings = { enabled, intervalHours: interval, type };
   try {
     await NotificationService.saveSettings(settings);
     Alert.alert(
       "Succès",
       "Paramètres enregistrés !",
       [{ text: "OK" }],
       { cancelable: false }
     );
    router.push('/(tabs)/pauseActive');

   } catch (err) {
     console.error(err);
     Alert.alert(
       "Erreur",
       "La sauvegarde a échoué, réessaie plus tard.",
       [{ text: "OK" }],
       { cancelable: false }
     );
   }
};

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text>Activer rappels</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>
      <View style={styles.row}>
        <Text>Intervalle (heures)</Text>
        <Picker
          selectedValue={interval}
          style={{ width: 100 }}
          onValueChange={(v) => setInterval(v)}
        >
          <Picker.Item label="1h" value={1} />
          <Picker.Item label="2h" value={2} />
          <Picker.Item label="3h" value={3} />
        </Picker>
      </View>
      <View style={styles.row}>
        <Text>Type de rappel</Text>
        <Picker
          selectedValue={type}
          style={{ width: 150 }}
          onValueChange={(v) => setType(v as 'pause'|'water')}
        >
          <Picker.Item label="Pause Active" value="pause" />
          <Picker.Item label="Boire de l’eau" value="water" />
        </Picker>
      </View>
      <Button title="Enregistrer" onPress={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
});
