/**
 * Options de personnalisation des rappels, telles que le design les présente
 * (« Personnalisez vos pauses »).
 *
 * Elles vivent hors de l'écran qui les affiche : le récapitulatif d'inscription
 * en restitue certaines, et les valeurs par défaut du service s'y réfèrent.
 */

export type ReminderType = 'pause' | 'water';

export interface ReminderSettings {
  /** Interrupteur général : coupe les rappels sans perdre le reste du réglage. */
  enabled: boolean;
  /** Intervalle entre deux rappels, en heures. */
  intervalHours: number;
  /** Types de rappel actifs. Les deux peuvent l'être simultanément. */
  pause: boolean;
  water: boolean;
  /** Plage horaire d'envoi, au format `HH:MM`. */
  startTime: string;
  endTime: string;
  /** Durée idéale d'une pause, en minutes. */
  pauseDurationMinutes: number;
  /** Nombre d'exercices par séance, tel que présenté à l'utilisateur. */
  exerciseCount: string;
}

/**
 * Réglage appliqué par défaut.
 *
 * Le parcours d'inscription ne demande qu'un consentement — rappels de pause,
 * rappels d'hydratation — et s'appuie sur ces valeurs pour le reste : les
 * notifications fonctionnent dès la première minute, et l'utilisateur qui veut
 * affiner passe par ses paramètres. La plage 9 h – 18 h vient du design.
 */
export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  intervalHours: 2,
  pause: true,
  water: true,
  startTime: '09:00',
  endTime: '18:00',
  pauseDurationMinutes: 5,
  exerciseCount: '3-4',
};

export interface FrequencyOption {
  /** Valeur transmise à `ReminderSettings.intervalHours`. */
  intervalHours: number;
  label: string;
}

/**
 * Fréquences proposées.
 *
 * « 3 fois par jour » est exprimé en intervalle comme les autres : sur une
 * plage de neuf heures, un rappel toutes les trois heures en donne bien trois.
 * Le design prévoit une entrée « Personnalisé » — elle ouvre ici les
 * intervalles plus espacés, faute d'une spécification plus précise.
 */
export const FREQUENCY_OPTIONS: readonly FrequencyOption[] = [
  { intervalHours: 1, label: 'Chaque heure' },
  { intervalHours: 2, label: 'Toutes les 2 h' },
  { intervalHours: 3, label: '3 fois par jour' },
];

export const CUSTOM_FREQUENCY_OPTIONS: readonly FrequencyOption[] = [
  { intervalHours: 4, label: 'Toutes les 4 h' },
  { intervalHours: 6, label: 'Toutes les 6 h' },
];

/** Durée idéale d'une pause, en minutes. */
export const PAUSE_DURATIONS: readonly number[] = [3, 5, 10, 15, 20];

/** Nombre d'exercices par séance. */
export const EXERCISE_COUNTS: readonly string[] = ['2-3', '3-4', '4-5', '5 et +'];

export function findFrequencyLabel(intervalHours: number): string {
  const option = [...FREQUENCY_OPTIONS, ...CUSTOM_FREQUENCY_OPTIONS].find(
    (candidate) => candidate.intervalHours === intervalHours,
  );
  return option ? option.label : `Toutes les ${intervalHours} h`;
}
