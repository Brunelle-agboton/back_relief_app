jest.mock('expo-notifications', () => ({
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(() => Promise.resolve()),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import NotificationService, {
  DEFAULT_REMINDER_SETTINGS,
  reminderSlots,
  type ReminderSettings,
} from '../NotificationService';

const scheduled = Notifications.scheduleNotificationAsync as jest.Mock;

function settings(overrides: Partial<ReminderSettings> = {}): ReminderSettings {
  return { ...DEFAULT_REMINDER_SETTINGS, ...overrides };
}

/** Heures planifiées, dans l'ordre, au format `H:MM`. */
function scheduledTimes(): string[] {
  return scheduled.mock.calls.map(([{ trigger }]) => `${trigger.hour}:${String(trigger.minute).padStart(2, '0')}`);
}

beforeEach(() => jest.clearAllMocks());

describe('créneaux de rappel', () => {
  it('couvre la plage à l’intervalle demandé', () => {
    expect(reminderSlots(settings({ startTime: '09:00', endTime: '18:00', intervalHours: 2 }))).toEqual([
      { hour: 9, minute: 0 },
      { hour: 11, minute: 0 },
      { hour: 13, minute: 0 },
      { hour: 15, minute: 0 },
      { hour: 17, minute: 0 },
    ]);
  });

  it('gère les intervalles non entiers et les minutes', () => {
    expect(reminderSlots(settings({ startTime: '08:30', endTime: '11:30', intervalHours: 1.5 }))).toEqual([
      { hour: 8, minute: 30 },
      { hour: 10, minute: 0 },
      { hour: 11, minute: 30 },
    ]);
  });

  it('ne produit rien sur une plage vide ou inversée', () => {
    expect(reminderSlots(settings({ startTime: '18:00', endTime: '09:00' }))).toEqual([]);
    expect(reminderSlots(settings({ startTime: '09:00', endTime: '09:00' }))).toEqual([]);
  });

  it('ne produit rien sur une heure mal formée', () => {
    // Une saisie libre peut être invalide : mieux vaut aucun rappel qu'une
    // planification à une heure aberrante.
    expect(reminderSlots(settings({ startTime: '9h', endTime: '18:00' }))).toEqual([]);
    expect(reminderSlots(settings({ startTime: '09:00', endTime: '25:00' }))).toEqual([]);
  });

  it('plafonne le nombre de créneaux', () => {
    // iOS ne retient que 64 notifications en attente : sans plafond, une plage
    // large à intervalle court ferait disparaître les dernières.
    const slots = reminderSlots(settings({ startTime: '00:00', endTime: '23:00', intervalHours: 1 }));
    expect(slots).toHaveLength(12);
  });
});

describe('planification', () => {
  it('pose un rappel quotidien par créneau', async () => {
    await NotificationService.scheduleReminders(settings({ water: false, intervalHours: 3 }));

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(scheduledTimes()).toEqual(['9:00', '12:00', '15:00', '18:00']);
    // Déclencheur quotidien et non à intervalle : l'ancien se répétait sans
    // interruption et réveillait l'utilisateur la nuit.
    expect(scheduled.mock.calls[0][0].trigger.type).toBe('daily');
  });

  it('décale l’hydratation d’une demi-période', async () => {
    // Deux notifications à la même minute se recouvrent : l'utilisateur n'en
    // verrait qu'une.
    await NotificationService.scheduleReminders(
      settings({ pause: true, water: true, intervalHours: 2, startTime: '09:00', endTime: '13:00' }),
    );

    expect(scheduledTimes()).toEqual(['9:00', '11:00', '13:00', '10:00', '12:00']);
  });

  it('ne planifie rien quand les rappels sont coupés', async () => {
    await NotificationService.scheduleReminders(settings({ enabled: false }));
    expect(scheduled).not.toHaveBeenCalled();
  });

  it('ne planifie rien quand aucun type n’est actif', async () => {
    await NotificationService.scheduleReminders(settings({ pause: false, water: false }));
    expect(scheduled).not.toHaveBeenCalled();
  });
});

describe('réglages persistés', () => {
  it('convertit un réglage de l’ancienne forme', async () => {
    // L'ancienne forme ne portait qu'un type unique et aucune plage horaire.
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ enabled: true, intervalHours: 3, type: 'water' }),
    );

    const loaded = await NotificationService.loadSettings();

    expect(loaded).toMatchObject({
      enabled: true,
      intervalHours: 3,
      pause: false,
      water: true,
      startTime: DEFAULT_REMINDER_SETTINGS.startTime,
    });
  });

  it('retient le type pause par défaut de l’ancienne forme', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ enabled: true, intervalHours: 1, type: 'pause' }),
    );

    expect(await NotificationService.loadSettings()).toMatchObject({ pause: true, water: false });
  });

  it('conserve un réglage déjà à la forme actuelle', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(settings({ pause: false, water: true, intervalHours: 6 })),
    );

    expect(await NotificationService.loadSettings()).toMatchObject({
      pause: false,
      water: true,
      intervalHours: 6,
    });
  });

  it('ignore un réglage illisible plutôt que d’empêcher le démarrage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{ pas du json');
    expect(await NotificationService.loadSettings()).toBeNull();
  });

  it('ne renvoie rien en l’absence de réglage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    expect(await NotificationService.loadSettings()).toBeNull();
  });
});
