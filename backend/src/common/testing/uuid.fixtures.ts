/**
 * Identifiants de test.
 *
 * Depuis le passage des clés primaires en UUID, les tests ne peuvent plus
 * s'appuyer sur `1`, `2`, `99`… : les routes valident le format avec
 * ParseUUIDPipe et les colonnes sont typées `uuid`. Ces constantes lisibles
 * remplacent les anciens identifiants numériques.
 */
export const UUID_A = '11111111-1111-4111-8111-111111111111';
export const UUID_B = '22222222-2222-4222-8222-222222222222';
export const UUID_C = '33333333-3333-4333-8333-333333333333';
export const UUID_D = '44444444-4444-4444-8444-444444444444';
export const UUID_E = '55555555-5555-4555-8555-555555555555';
export const UUID_MISSING = '99999999-9999-4999-8999-999999999999';
