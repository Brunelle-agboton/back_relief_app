import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  Chip,
  FormMessage,
  OptionRow,
  ScrollScreen,
  Segmented,
  Text,
  TextField,
} from '@/components/ui';
import {
  CUSTOM_FREQUENCY_OPTIONS,
  DEFAULT_REMINDER_SETTINGS,
  EXERCISE_COUNTS,
  FREQUENCY_OPTIONS,
  PAUSE_DURATIONS,
  type ReminderSettings,
} from '@/constants/reminderSettings';
import NotificationService from '@/services/NotificationService';
import { makeStyles } from '@/theme';

const YES_NO = [
  { label: 'Oui', value: true },
  { label: 'Non', value: false },
];

const useStyles = makeStyles((theme) => ({
  section: {
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  rowItem: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
}));

export default function ReminderSettingsScreen() {
  const router = useRouter();
  const styles = useStyles();

  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [customFrequency, setCustomFrequency] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await NotificationService.loadSettings();
      if (stored) {
        setSettings(stored);
        setCustomFrequency(
          CUSTOM_FREQUENCY_OPTIONS.some((o) => o.intervalHours === stored.intervalHours),
        );
      }
    })();
  }, []);

  /** Applique une modification partielle sans écraser le reste du réglage. */
  const update = (patch: Partial<ReminderSettings>) =>
    setSettings((current) => ({ ...current, ...patch }));

  const handleSave = async () => {
    setSubmitting(true);
    setError('');
    setSaved('');
    try {
      await NotificationService.saveSettings(settings);
      setSaved('Vos rappels ont été mis à jour.');
    } catch (e) {
      console.error(e);
      setError("L'enregistrement a échoué. Réessayez plus tard.");
    } finally {
      setSubmitting(false);
    }
  };

  const frequencies = customFrequency ? CUSTOM_FREQUENCY_OPTIONS : FREQUENCY_OPTIONS;

  return (
    <ScrollScreen>
      <View>
        <Text variant="h1">Personnalisez vos pauses</Text>
        <Text variant="sub">Quand et comment vous souhaitez être relancé.</Text>
      </View>

      <View style={styles.section}>
        <Text variant="meta">Rappel de pause</Text>
        <Segmented
          accessibilityLabel="Rappel de pause"
          value={settings.pause}
          onChange={(pause) => update({ pause })}
          options={[
            { ...YES_NO[0], testID: 'pause-yes' },
            { ...YES_NO[1], testID: 'pause-no' },
          ]}
        />
      </View>

      <View style={styles.section}>
        <Text variant="meta">Rappel d&apos;hydratation</Text>
        <Segmented
          accessibilityLabel="Rappel d'hydratation"
          value={settings.water}
          onChange={(water) => update({ water })}
          options={[
            { ...YES_NO[0], testID: 'water-yes' },
            { ...YES_NO[1], testID: 'water-no' },
          ]}
        />
      </View>

      <View style={styles.section}>
        <Text variant="meta">Fréquence des rappels</Text>
        {frequencies.map((option) => (
          <OptionRow
            key={option.intervalHours}
            testID={`frequency-${option.intervalHours}`}
            label={option.label}
            selected={settings.intervalHours === option.intervalHours}
            onPress={() => update({ intervalHours: option.intervalHours })}
          />
        ))}
        <OptionRow
          testID="frequency-custom"
          label="Personnalisé"
          selected={customFrequency}
          onPress={() => setCustomFrequency((value) => !value)}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <TextField
            label="À partir de"
            placeholder="09:00"
            value={settings.startTime}
            onChangeText={(startTime) => update({ startTime })}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.rowItem}>
          <TextField
            label="Jusqu'à"
            placeholder="18:00"
            value={settings.endTime}
            onChangeText={(endTime) => update({ endTime })}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="meta">Durée idéale d&apos;une pause</Text>
        <View style={styles.chips}>
          {PAUSE_DURATIONS.map((minutes) => (
            <Chip
              key={minutes}
              testID={`duration-${minutes}`}
              label={`${minutes} min`}
              variant={settings.pauseDurationMinutes === minutes ? 'on' : 'default'}
              selected={settings.pauseDurationMinutes === minutes}
              onPress={() => update({ pauseDurationMinutes: minutes })}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="meta">Exercices par séance</Text>
        <View style={styles.chips}>
          {EXERCISE_COUNTS.map((count) => (
            <Chip
              key={count}
              testID={`exercises-${count}`}
              label={count}
              variant={settings.exerciseCount === count ? 'on' : 'default'}
              selected={settings.exerciseCount === count}
              onPress={() => update({ exerciseCount: count })}
            />
          ))}
        </View>
      </View>

      <FormMessage message={error} testID="reminder-error" />
      <FormMessage message={saved} tone="success" testID="reminder-saved" />

      <Button
        accessibilityLabel="Valider le profil"
        title="Valider le profil"
        size="lg"
        block
        loading={submitting}
        onPress={handleSave}
      />

      <Button
        accessibilityLabel="Retour"
        title="Retour"
        variant="ghost"
        block
        onPress={() => router.back()}
      />
    </ScrollScreen>
  );
}
