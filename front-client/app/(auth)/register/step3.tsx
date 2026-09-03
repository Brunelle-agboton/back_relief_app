import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  FormMessage,
  OptionRow,
  ScrollScreen,
  Segmented,
  StepHeader,
  StepProgress,
  Text,
} from '@/components/ui';
import {
  ACTIVITY_LEVELS,
  REGISTER_STEP_COUNT,
  SIT_OPTIONS,
  findActivityLevel,
  type ActivityLevelId,
} from '@/constants/registerProfile';
import api from '@/services/api';
import { makeStyles, px } from '@/theme';
import { toNumber, toText } from '@/utils/searchParams';

const YES_NO = [
  { label: 'Oui', value: true },
  { label: 'Non', value: false },
];

const useStyles = makeStyles((theme) => ({
  section: {
    gap: theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
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
  const [activity, setActivity] = useState<ActivityLevelId | null>(null);
  const [restReminder, setRestReminder] = useState(false);
  const [drinkReminder, setDrinkReminder] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Le niveau d'activité porte les deux champs attendus par l'API.
  const activityLevel = activity ? findActivityLevel(activity) : undefined;

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
        isExercise: activityLevel ? activityLevel.isExercise : null,
        numberTraining: activityLevel ? activityLevel.numberTraining : 0,
        restReminder,
        drinkReminder,
      });
      router.push({
        pathname: '/register/done',
        params: {
          email: toText(email),
          age: toText(age),
          poids: toText(poids),
          taille: toText(taille),
          hourSit: String(hourSit),
          activity: activity ?? '',
        },
      });
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
          En moyenne, vous êtes assis
        </Text>
        {SIT_OPTIONS.map((option) => (
          <OptionRow
            key={option.value}
            testID={`sit-${option.value}`}
            label={option.label}
            selected={hourSit === option.value}
            onPress={() => setHourSit(option.value)}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text variant="meta" style={styles.fieldLabel}>
          Niveau d'activité physique
        </Text>
        {ACTIVITY_LEVELS.map((level) => (
          <OptionRow
            key={level.id}
            testID={`activity-${level.id}`}
            label={level.label}
            description={level.description}
            selected={activity === level.id}
            onPress={() => setActivity(level.id)}
          />
        ))}
      </View>

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

      <FormMessage message={error} testID="step3-error" />

      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <Button
            accessibilityLabel="Précédent"
            title="Précédent"
            variant="secondary"
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
