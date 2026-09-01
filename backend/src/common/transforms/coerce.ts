import { plainToInstance, Transform } from 'class-transformer';

/**
 * Coercitions appliquées AVANT validation.
 *
 * Le client mobile (expo-router) transmet ses paramètres de navigation sous
 * forme de chaînes : un tableau devient du JSON sérialisé, un nombre devient
 * « 42 », un champ vide devient « ». Ces helpers normalisent ces valeurs pour
 * que le ValidationPipe global (SEC-05) rejette les vraies erreurs sans casser
 * les clients déjà déployés.
 */

const parseJson = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    // Laisse la valeur brute : la contrainte class-validator produira l'erreur.
    return value;
  }
};

/** « [\"a\",\"b\"] » → ['a', 'b'] */
export const ToJsonArray = () => Transform(({ value }) => parseJson(value));

/** « {\"2026-01-01\":[\"09:00\"]} » → objet */
export const ToJsonObject = () => Transform(({ value }) => parseJson(value));

/**
 * Comme ToJsonArray, mais pour un tableau d'objets imbriqués : les éléments
 * sont instanciés dans leur classe de DTO.
 *
 * Indispensable dès qu'on combine une transformation personnalisée et
 * @ValidateNested : class-transformer applique @Type AVANT la transformation,
 * qui remplace ensuite le résultat par des objets simples. class-validator ne
 * retrouve alors aucune métadonnée sur ces objets et, en mode `whitelist`,
 * supprime *toutes* leurs propriétés — le tableau arrive vide au service.
 */
export const ToJsonArrayOf = <T>(cls: new (...args: never[]) => T) =>
  Transform(({ value }) => {
    const parsed = parseJson(value);
    return Array.isArray(parsed) ? plainToInstance(cls, parsed) : parsed;
  });

/** { a: 1 } → « {\"a\":1} » (colonne texte) */
export const ToJsonString = () =>
  Transform(({ value }) =>
    value !== null && typeof value === 'object' ? JSON.stringify(value) : value,
  );

/**
 * « 42 » → 42 ; « », null, undefined et NaN → undefined (le champ est alors
 * simplement absent, à combiner avec @IsOptional()).
 */
export const ToOptionalNumber = () =>
  Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  });

/** « true » / « 1 » → true, « false » / « 0 » → false, sinon valeur inchangée. */
export const ToOptionalBoolean = () =>
  Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    const normalized = String(value).toLowerCase();
    if (['true', '1', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
    return value;
  });

/** Normalise un e-mail (trim + minuscules) avant validation et stockage. */
export const NormalizeEmail = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
