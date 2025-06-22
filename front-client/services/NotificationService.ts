import * as Notifications from 'expo-notifications';
import * as Permissions   from 'expo-permissions';
import AsyncStorage       from '@react-native-async-storage/async-storage';

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

export type ReminderSettings = {
  enabled: boolean;
  intervalHours: number;  
  type: 'pause' | 'water';
};

export default class NotificationService {
  static async requestPermissions() {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    if (status !== 'granted') {
      throw new Error('Notification permissions not granted');
    }
  }

  static async scheduleReminders(settings: ReminderSettings) {
    // Annuler d’abord les anciens rappels
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.enabled) return;
    //3600
    const seconds = settings.intervalHours * 3600;
    
    // tirage aléatoire du message
    const pool = MESSAGES[settings.type];
    const { title, body } = pool[Math.floor(Math.random() * pool.length)];

    // Planifier une notification à intervalle récurrent
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type:    'timeInterval',  
      seconds,
      repeats: true,
    } as Notifications.TimeIntervalTriggerInput,
    });
  }

  static async saveSettings(settings: ReminderSettings) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    await this.scheduleReminders(settings);
  }

  static async loadSettings(): Promise<ReminderSettings | null> {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : null;
  }
}
