import * as Notifications from 'expo-notifications';
import AsyncStorage       from '@react-native-async-storage/async-storage';

import {
  DEFAULT_REMINDER_SETTINGS,
  type ReminderSettings,
  type ReminderType,
} from '@/constants/reminderSettings';

// Réexportés pour les consommateurs qui passent déjà par le service ; les
// écrans qui n'ont besoin que du contrat de données doivent les importer
// depuis `@/constants/reminderSettings`, sans tirer le module natif.
export { DEFAULT_REMINDER_SETTINGS };
export type { ReminderSettings, ReminderType };

const STORAGE_KEY = '@reminder_settings';
const MESSAGES = {
  pause: [
    {
      title: "Une pause active maintenant = plus de focus après",
      body:  "Sélectionne une pause dans ton appli !",
    },
    {
      title: "C’est l’heure de la paus’active !",
      body:  "Prends 2 minutes pour toi : lève-toi, respire, étire-toi.",
    },
    {
      title: "Prends 2 minutes pour toi",
      body:  "Ton corps en a besoin : lève-toi, respire, étire-toi.",
    },
  ],
  water: [
    {
      title: " N'oublie pas de boire un verre d'eau !",
      body:  "Ton corps te remerciera.",
    },
    {
      body: "Pense à t’hydrater !💧",
      title:  "Un petit verre d’eau fait toujours du bien💧",
    },
  ],
};

/**
 * Plafond de notifications planifiées par type.
 *
 * iOS n'en conserve que 64 en attente, toutes applications confondues :
 * dépasser ce plafond ferait silencieusement disparaître les dernières.
 */
const MAX_SLOTS_PER_TYPE = 12;

function parseTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? '');
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

/**
 * Heures d'envoi comprises dans la plage, à l'intervalle demandé.
 *
 * Le décalage sert à ne pas faire tomber le rappel d'hydratation à la minute
 * exacte du rappel de pause : deux notifications simultanées se recouvrent, et
 * l'utilisateur n'en voit qu'une.
 */
export function reminderSlots(
  settings: ReminderSettings,
  offsetMinutes = 0,
): { hour: number; minute: number }[] {
  const start = parseTime(settings.startTime);
  const end = parseTime(settings.endTime);
  const step = Math.max(1, Math.round(settings.intervalHours * 60));

  if (start === null || end === null || end <= start) {
    return [];
  }

  const slots: { hour: number; minute: number }[] = [];
  for (
    let minute = start + offsetMinutes;
    minute <= end && slots.length < MAX_SLOTS_PER_TYPE;
    minute += step
  ) {
    slots.push({ hour: Math.floor(minute / 60) % 24, minute: minute % 60 });
  }
  return slots;
}

export default class NotificationService {
  static async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowSound: true,
        allowBadge: true,
      },
    });
    if (status !== 'granted') {
      throw new Error('Notification permissions not granted');
    }
  }

  /**
   * Planifie les rappels sur la plage horaire choisie.
   *
   * Des déclencheurs quotidiens remplacent le déclencheur à intervalle qui
   * était employé jusqu'ici : ce dernier se répétait sans interruption, et
   * réveillait donc l'utilisateur en pleine nuit. Une notification est posée
   * par créneau et par type actif.
   */
  static async scheduleReminders(settings: ReminderSettings) {
    // Annuler d’abord les anciens rappels
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.enabled) return;

    const active: ReminderType[] = [];
    if (settings.pause) active.push('pause');
    if (settings.water) active.push('water');

    // L'hydratation est décalée d'une demi-période pour ne pas se superposer
    // au rappel de pause.
    const halfStep = Math.round((settings.intervalHours * 60) / 2);

    for (const type of active) {
      const slots = reminderSlots(settings, type === 'water' ? halfStep : 0);

      for (const slot of slots) {
        // tirage aléatoire du message
        const pool = MESSAGES[type];
        const { title, body } = pool[Math.floor(Math.random() * pool.length)];

        await Notifications.scheduleNotificationAsync({
          content: { title, body },
          trigger: {
            type: 'daily',
            hour: slot.hour,
            minute: slot.minute,
          } as Notifications.DailyTriggerInput,
        });
      }
    }
  }

  static async saveSettings(settings: ReminderSettings) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    await this.scheduleReminders(settings);
  }

  static async loadSettings(): Promise<ReminderSettings | null> {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) {
      return null;
    }
    try {
      return this.migrate(JSON.parse(json));
    } catch {
      // Un réglage illisible ne doit pas empêcher l'app de démarrer : on repart
      // des valeurs par défaut au prochain enregistrement.
      return null;
    }
  }

  /**
   * Complète un réglage enregistré par une version antérieure.
   *
   * L'ancienne forme ne portait qu'un `type` unique — `'pause'` ou `'water'` —
   * et aucune plage horaire. Les installations existantes sont converties sans
   * perte : le type retenu devient le seul actif.
   */
  static migrate(stored: Partial<ReminderSettings> & { type?: ReminderType }): ReminderSettings {
    const hasTypeFlags = stored.pause !== undefined || stored.water !== undefined;

    return {
      ...DEFAULT_REMINDER_SETTINGS,
      ...stored,
      pause: hasTypeFlags ? !!stored.pause : stored.type !== 'water',
      water: hasTypeFlags ? !!stored.water : stored.type === 'water',
    };
  }
}
