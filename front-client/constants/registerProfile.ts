/**
 * Options du parcours d'inscription patient et traduction vers l'API.
 *
 * Ces constantes vivent hors des modules de route : elles sont consommées par
 * l'étape qui les saisit comme par le récapitulatif qui les restitue, et rien
 * n'oblige ces deux écrans à s'importer l'un l'autre.
 *
 * Le design propose des tranches (« moins de 8 h », « 3 à 4 séances »), là où
 * l'API attend des nombres — `hourSit`, `isExercise`, `numberTraining`. La
 * traduction est faite ici, à un seul endroit.
 */

/** Nombre d'étapes du parcours d'inscription patient. */
export const REGISTER_STEP_COUNT = 3;

export interface SitOption {
  /** Valeur transmise à l'API pour `hourSit`. */
  value: number;
  label: string;
}

/**
 * Temps assis par jour.
 *
 * Les valeurs sont représentatives de leur tranche : les bornes ouvertes
 * prennent la valeur entière la plus proche du centre de la tranche, faute de
 * pouvoir transmettre un intervalle à l'API.
 */
export const SIT_OPTIONS: readonly SitOption[] = [
  { value: 7, label: 'Moins de 8 h' },
  { value: 9, label: '9 h' },
  { value: 10, label: '10 h' },
  { value: 12, label: 'Plus de 10 h' },
];

export type ActivityLevelId = 'sedentaire' | 'leger' | 'modere' | 'actif';

export interface ActivityLevel {
  id: ActivityLevelId;
  label: string;
  description: string;
  /** Traduction vers les deux champs attendus par l'API. */
  isExercise: boolean;
  numberTraining: number;
}

/** Niveau d'activité physique hebdomadaire. */
export const ACTIVITY_LEVELS: readonly ActivityLevel[] = [
  {
    id: 'sedentaire',
    label: 'Sédentaire',
    description: 'Peu ou pas de sport',
    isExercise: false,
    numberTraining: 0,
  },
  {
    id: 'leger',
    label: 'Léger',
    description: '1 à 2 séances / semaine',
    isExercise: true,
    numberTraining: 2,
  },
  {
    id: 'modere',
    label: 'Modéré',
    description: '3 à 4 séances / semaine',
    isExercise: true,
    numberTraining: 4,
  },
  {
    id: 'actif',
    label: 'Actif',
    description: '5 séances / semaine ou plus',
    isExercise: true,
    numberTraining: 5,
  },
];

export function findSitOption(value: string): SitOption | undefined {
  return SIT_OPTIONS.find((option) => String(option.value) === value);
}

export function findActivityLevel(id: string): ActivityLevel | undefined {
  return ACTIVITY_LEVELS.find((level) => level.id === id);
}
