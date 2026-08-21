import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Button, Card, Divider, ScrollScreen, Text } from '@/components/ui';
import { makeStyles, px, useTheme } from '@/theme';
import { toText } from '@/utils/searchParams';

const BADGE = px(76);

const useStyles = makeStyles((theme) => ({
  // `OnbDone` : médaillon de réussite, aplat clair de la couleur de validation.
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: theme.colors.goodSoft,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intro: {
    alignItems: 'center',
    gap: theme.spacing.xxs,
  },
  introText: {
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    paddingVertical: px(7),
  },
  summaryValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
}));

/** Une ligne du récapitulatif : intitulé à gauche, valeur à droite. */
function SummaryRow({ label, value }: { label: string; value: string }) {
  const styles = useStyles();

  return (
    <View style={styles.summaryRow} accessible accessibilityLabel={`${label} : ${value}`}>
      <Text variant="meta">{label}</Text>
      <Text variant="bodyStrong" style={styles.summaryValue}>
        {value}
      </Text>
    </View>
  );
}

/** Le dernier palier de l'étape 3 couvre tout ce qui dépasse 12 h. */
function formatSitting(hourSit: string): string {
  if (!hourSit || hourSit === 'null') {
    return '—';
  }
  return hourSit === '14' ? 'Plus de 12 h par jour' : `${hourSit} h par jour`;
}

/** Le dernier palier de l'étape 3 couvre tout ce qui dépasse 3 séances. */
function formatActivity(isExercise: string, numberTraining: string): string {
  if (isExercise !== 'true') {
    return 'Pas d’activité régulière';
  }
  if (numberTraining === '4') {
    return 'Plus de 3 séances / semaine';
  }
  if (!numberTraining || numberTraining === 'null') {
    return 'Activité régulière';
  }
  return `${numberTraining} séance${numberTraining === '1' ? '' : 's'} / semaine`;
}

function formatOrDash(value: string, suffix: string): string {
  return value ? `${value} ${suffix}` : '—';
}

/**
 * Confirmation de création de compte, transcrite de `OnbDone`.
 *
 * Le design conclut sur « Découvrir l'app ». L'inscription n'ouvrant pas de
 * session — l'API ne renvoie pas de jeton sur `/user/register` —, le bouton
 * mène à la connexion et le libellé le dit.
 */
export default function RegisterDoneScreen() {
  const router = useRouter();
  const styles = useStyles();
  const theme = useTheme();
  const params = useLocalSearchParams();

  const email = toText(params.email);
  const poids = toText(params.poids);
  const age = toText(params.age);
  const taille = toText(params.taille);

  return (
    <ScrollScreen centered>
      <View style={styles.badge}>
        <Ionicons name="checkmark" size={px(34)} color={theme.colors.good} />
      </View>

      <View style={styles.intro}>
        <Text variant="h1" style={styles.introText}>
          Votre profil est prêt
        </Text>
        <Text variant="sub" style={styles.introText}>
          Vos pauses actives sont désormais personnalisées selon votre morphologie et votre
          quotidien.
        </Text>
      </View>

      <Card>
        <SummaryRow label="Compte" value={email || '—'} />
        <Divider />
        <SummaryRow
          label="Poids / Âge"
          value={poids && age ? `${poids} kg · ${age} ans` : '—'}
        />
        <Divider />
        <SummaryRow label="Taille" value={formatOrDash(taille, 'm')} />
        <Divider />
        <SummaryRow label="Sédentarité" value={formatSitting(toText(params.hourSit))} />
        <Divider />
        <SummaryRow
          label="Activité"
          value={formatActivity(toText(params.isExercise), toText(params.numberTraining))}
        />
      </Card>

      <Button
        accessibilityLabel="Se connecter"
        title="Se connecter"
        size="lg"
        block
        onPress={() => router.replace('/login')}
      />
    </ScrollScreen>
  );
}
