/**
 * Normalisation des paramètres de navigation d'expo-router.
 *
 * `useLocalSearchParams` renvoie `string | string[] | undefined` selon qu'un
 * paramètre a été transmis une ou plusieurs fois. Les écrans attendent une
 * valeur unique : on ne retient que la première occurrence.
 */
export type SearchParam = string | string[] | undefined;

export function toText(value: SearchParam): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export function toNumber(value: SearchParam): number {
  return parseInt(toText(value), 10);
}
