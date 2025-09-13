/* Format utilitaire pour react-native-calendars (YYYY-MM-DD) */
export const formatDate = (d = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * @file Ce fichier définit les structures de données pour la gestion des disponibilités.
 * Il exporte les jours de la semaine et une liste de plages horaires.
 */

// 1. Définition des jours de la semaine avec un identifiant et un nom
export const daysOfWeek = [
  { id: 'monday', name: 'Lundi' },
  { id: 'tuesday', name: 'Mardi' },
  { id: 'wednesday', name: 'Mercredi' },
  { id: 'thursday', name: 'Jeudi' },
  { id: 'friday', name: 'Vendredi' },
  { id: 'saturday', name: 'Samedi' },
  { id: 'sunday', name: 'Dimanche' },
];

/**
 * Génère une liste de plages horaires à un intervalle donné.
 * @param start Heure de début au format "HH:MM".
 * @param end Heure de fin au format "HH:MM".
 * @param interval Intervalle en minutes.
 * @returns Un tableau de chaînes de caractères représentant les heures (ex: ["08:00", "08:30"]).
 */
const generateTimeSlots = (start: string, end: string, interval: number): string[] => {
  const slots: string[] = [];
  // Utilise une date arbitraire pour manipuler l'heure
  let currentTime = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);

  while (currentTime <= endTime) {
    slots.push(
      currentTime.toTimeString().slice(0, 5) // Formate en "HH:MM"
    );
    // Ajoute l'intervalle pour la prochaine itération
    currentTime.setMinutes(currentTime.getMinutes() + interval);
  }
  return slots;
};

// 2. Exportation des plages horaires générées de 8h00 à 20h00, par tranches de 30 minutes.
export const timeSlots = generateTimeSlots('08:00', '20:00', 30);

/*
  Exemple du contenu de `timeSlots` :
  [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
  ]
*/