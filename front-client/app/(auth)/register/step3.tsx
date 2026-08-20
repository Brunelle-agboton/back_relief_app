import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  FormError,
  OptionRow,
  ScrollScreen,
  Segmented,
  StepHeader,
  StepProgress,
  Text,
} from '@/components/ui';
import api from '@/services/api';
import { makeStyles, px } from '@/theme';

import { REGISTER_STEP_COUNT } from './step1';

/** Paliers d'heures assises. Le dernier couvre tout ce qui dépasse 12 h. */
const SIT_OPTIONS = [
  { hours: 8, label: '8' },
  { hours: 9, label: '9' },
  { hours: 10, label: '10' },
  { hours: 12, label: '12' },
  { hours: 14, label: 'Plus de 12' },
];

/** Séances hebdomadaires. Le dernier palier couvre tout ce qui dépasse 3. */
const TRAINING_OPTIONS = [
  { times: 1, label: '1' },
  { times: 2, label: '2' },
  { times: 3, label: '3' },
  { times: 4, label: 'Plus de 3' },
];

const YES_NO = [
  { label: 'Oui', value: true },
  { label: 'Non', value: false },
];

/**
 * Les paramètres de navigation arrivent en `string | string[]` selon qu'ils ont
 * été passés une ou plusieurs fois : on ne retient que la première occurrence.
 */
function toNumber(value: string | string[] | undefined): number {
  return parseInt(Array.isArray(value) ? value[0] : (value ?? ''), 10);
}

function toText(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : (value ?? '');
}

const useStyles = makeStyles((theme) => ({
  section: {
    gap: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionItem: {
    flex: 1,
  },
  fieldLabel: {
    marginBottom: px(2),
  },
}));

export default function RegisterStep3Screen() {
  const router = useRouter();
  const styles = useStyles();
  const { email, password, userName, age, sexe, poids, taille } = useLocalSearchParams();

  const [hourSit, setHourSit] = useState<number | null>(null);
  const [isExercise, setIsExercise] = useState<boolean | null>(null);
  const [numberTraining, setNumberTraining] = useState<number | null>(null);
  const [restReminder, setRestReminder] = useState(false);
  const [drinkReminder, setDrinkReminder] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    setSubmitting(true);
    try {
      await api.post('/user/register', {
        email: toText(email),
        password: toText(password),
        userName: toText(userName),
        role: 'user',
        age: toNumber(age),
        sexe: toText(sexe),
        poids: toNumber(poids),
        taille: toNumber(taille),
        hourSit: Number(hourSit),
        isExercise,
        numberTraining: Number(numberTraining),
        restReminder,
        drinkReminder,
      });
      router.push('/login');
    } catch (e) {
      setError("Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollScreen>
      <StepHeader step={2} count={REGISTER_STEP_COUNT} onBack={handleBack} />
      <StepProgress step={2} count={REGISTER_STEP_COUNT} />

      <View>
        <Text variant="h1">Votre quotidien</Text>
        <Text variant="sub">Ces réponses ajustent la fréquence de vos pauses.</Text>
      </View>

      <View style={styles.section}>
        <Text variant="meta" style={styles.fieldLabel}>
          En moyenne, vous êtes assis (heures par jour)
        </Text>
        {SIT_OPTIONS.map((option) => (
          <OptionRow
            key={option.hours}
            testID={`sit-${option.hours}`}
            label={option.label}
            selected={hourSit === option.hours}
            onPress={() => setHourSit(option.hours)}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text variant="meta" style={styles.fieldLabel}>
          Activité physique régulière ?
        </Text>
        <Segmented
          accessibilityLabel="Activité physique régulière"
          value={isExercise}
          onChange={setIsExercise}
          options={[
            { ...YES_NO[0], testID: 'exercise-yes' },
            { ...YES_NO[1], testID: 'exercise-no' },
          ]}
        />
      </View>

      {isExercise ? (
        <View style={styles.section}>
          <Text variant="meta" style={styles.fieldLabel}>
            Si oui, combien de fois par semaine ?
          </Text>
          {TRAINING_OPTIONS.map((option) => (
            <OptionRow
              key={option.times}
              testID={`training-${option.times}`}
              label={option.label}
              selected={numberTraining === option.times}
              onPress={() => setNumberTraining(option.times)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text variant="meta" style={styles.fieldLabel}>
          Souhaitez-vous activer les rappels :
        </Text>

        <Text variant="bodySm" color="ink2">
          Rappel de pause
        </Text>
        <Segmented
          accessibilityLabel="Rappel de pause"
          value={restReminder}
          onChange={setRestReminder}
          options={[
            { ...YES_NO[0], testID: 'reset-yes' },
            { ...YES_NO[1], testID: 'reset-no' },
          ]}
        />

        <Text variant="bodySm" color="ink2">
          Rappel d'hydratation
        </Text>
        <Segmented
          accessibilityLabel="Rappel d'hydratation"
          value={drinkReminder}
          onChange={setDrinkReminder}
          options={[
            { ...YES_NO[0], testID: 'drink-yes' },
            { ...YES_NO[1], testID: 'drink-no' },
          ]}
        />
      </View>

      <FormError message={error} testID="step3-error" />

      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <Button
            accessibilityLabel="Précédent"
            title="Précédent"
            variant="outline"
            size="lg"
            block
            onPress={handleBack}
          />
        </View>
        <View style={styles.actionItem}>
          <Button
            accessibilityLabel="Suivant"
            title="Suivant"
            size="lg"
            block
            loading={submitting}
            onPress={handleRegister}
          />
        </View>
      </View>
    </ScrollScreen>
  );
}
