/**
 * Passage des mesures du design aux points de densité indépendante.
 *
 * Le design est maquetté dans un cadre de téléphone de 300 × 642 px
 * (`.pa-phone`), soit une réduction d'un appareil de référence d'environ
 * 375 pt de large — le ratio 300/642 correspond bien à celui d'un iPhone
 * moderne. Toutes les mesures du design sont donc multipliées par ce facteur
 * avant d'entrer dans le thème, ce qui évite une interface systématiquement
 * 25 % trop petite sur appareil réel.
 *
 * Les valeurs du design restent lisibles en clair dans les tokens : ajuster le
 * facteur ici recalibre l'ensemble de l'interface d'un seul geste.
 */
export const DESIGN_FRAME_WIDTH = 300;
export const REFERENCE_DEVICE_WIDTH = 375;
export const DESIGN_SCALE = REFERENCE_DEVICE_WIDTH / DESIGN_FRAME_WIDTH;

/** Convertit une mesure du design en points, arrondie au demi-point. */
export function px(designPx: number): number {
  return Math.round(designPx * DESIGN_SCALE * 2) / 2;
}

/** Convertit un `letter-spacing` exprimé en `em` par le design en points. */
export function em(value: number, fontSizeInPoints: number): number {
  return Math.round(value * fontSizeInPoints * 100) / 100;
}
