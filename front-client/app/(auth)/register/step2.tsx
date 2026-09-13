import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, View } from 'react-native';

import {
  Button,
  ScrollScreen,
  Segmented,
  StepHeader,
  StepProgress,
  Text,
  TextField,
} from '@/components/ui';
import { REGISTER_STEP_COUNT } from '@/constants/registerProfile';
import { makeStyles, px } from '@/theme';

/**
 * Les libellés servent aussi de valeurs : c'est ce que l'API attend pour
 * `sexe`, et l'étape suivante les transmet tels quels.
 */
const SEXE_OPTIONS = [
  { label: 'Homme', value: 'Homme', testID: 'radio-homme' },
  { label: 'Femme', value: 'Femme', testID: 'radio-femme' },
  { label: 'Non-binaire', value: 'Non-binaire', testID: 'radio-nonbinaire' },
] as const;

const useStyles = makeStyles((theme) => ({
  logoBadge: {
    width: px(84),
    height: px(84),
    borderRadius: px(42),
    backgroundColor: theme.colors.accentSoft,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: px(58),
    height: px(58),
    resizeMode: 'contain',
  },
  // `OnbPhysical` dispose deux mesures côte à côte.
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  rowItem: {
    flex: 1,
  },
  field: {
    gap: px(6),
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionItem: {
    flex: 1,
  },
}));

export default function RegisterStep2Screen() {
  const router = useRouter();
  const navigation = useNavigation();
  const styles = useStyles();
  const { userName, email, password } = useLocalSearchParams();

  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState('');
  const [taille, setTaille] = useState('');
  const [poids, setPoids] = useState('');

  // Même règle qu'à l'étape 3 : sans ces réponses, l'API recevrait `NaN`.
  const canSubmit = !!sexe && !!age.trim() && !!taille.trim() && !!poids.trim();

  const handleNext = () => {
    router.push({
      pathname: '/register/step3',
      params: { userName, email, password, age, sexe, poids, taille },
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollScreen>
      <StepHeader step={1} count={REGISTER_STEP_COUNT} onBack={handleBack} />
      <StepProgress step={1} count={REGISTER_STEP_COUNT} />

      <View style={styles.logoBadge}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          testID="logo-image"
        />
      </View>

      <View>
        <Text variant="h1">Parlez-nous de vous</Text>
        <Text variant="sub">
          Personnalisez votre expérience pour des recommandations ciblées, un suivi intelligent de
          vos douleurs, et des pauses actives sur mesure
        </Text>
      </View>

      <View style={styles.field}>
        <Text variant="meta">Sexe</Text>
        <Segmented
          accessibilityLabel="Sexe"
          value={sexe || null}
          onChange={setSexe}
          options={SEXE_OPTIONS}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <TextField
            label="Poids (kg)"
            placeholder="Poids"
            value={poids}
            onChangeText={setPoids}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.rowItem}>
          <TextField
            label="Âge (ans)"
            placeholder="Âge"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
        </View>
      </View>

      <TextField
        label="Taille (m)"
        placeholder="Taille"
        value={taille}
        onChangeText={setTaille}
        keyboardType="numeric"
      />

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
            disabled={!canSubmit}
            onPress={handleNext}
          />
        </View>
      </View>
    </ScrollScreen>
  );
}
