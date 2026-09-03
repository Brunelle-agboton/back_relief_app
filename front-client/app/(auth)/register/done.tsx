import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Button, Card, Divider, ScrollScreen, Text } from '@/components/ui';
import { findActivityLevel, findSitOption } from '@/constants/registerProfile';
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

/**
 * Les valeurs transmises à l'API représentent des tranches : le récapitulatif
 * restitue le libellé choisi, jamais le nombre qui le code.
 */
function formatSitting(hourSit: string): string {
  return findSitOption(hourSit)?.label ?? '—';
}

function formatActivity(activity: string): string {
  const level = findActivityLevel(activity);
  return level ? `${level.label} · ${level.description}` : '—';
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
        <SummaryRow label="Temps assis" value={formatSitting(toText(params.hourSit))} />
        <Divider />
        <SummaryRow label="Activité" value={formatActivity(toText(params.activity))} />
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
