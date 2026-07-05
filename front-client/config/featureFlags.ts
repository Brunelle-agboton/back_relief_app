/**
 * BackRelief — Feature Flags
 *
 * Source de vérité unique pour la disponibilité publique de chaque fonctionnalité.
 * Passer un flag à `true` expose la feature ; `false` la masque de l'UI.
 *
 * IMPORTANT : ce fichier contrôle uniquement l'UI (couche de présentation).
 * Les features premium nécessiteront en plus un guard backend (PlanGuard) côté API.
 *
 * Sections :
 *   V1.0 OPEN       — ouvertes au public dès le lancement
 *   V1.0 HIDDEN     — développées mais non exposées pour le lancement
 *   FUTUR PREMIUM   — réservées au modèle freemium (V1.5+)
 */

export const FEATURES = {
  // ─── V1.0 OPEN ─────────────────────────────────────────────────────────────
  home: true,
  exerciseLibrary: true,
  painTracking: true,
  hydrationTracking: true,
  healthStats: true,
  reminders: true,
  contentCatalog: true,   // articles statiques (validés médicalement)

  proDashboard: true,
  proAgenda: true,
  proProfile: true,

  // ─── V1.0 HIDDEN ───────────────────────────────────────────────────────────
  // Passer à `true` pour exposer au public (pas de recompilation nécessaire).
  teleconsultation: false,      // attente : RGPD + disponibilité praticiens
  asyncConsultation: false,     // dépend de la téléconsultation
  proMessaging: false,          // UI mock — backend non finalisé

  // ─── FUTUR PREMIUM (V1.5+) ─────────────────────────────────────────────────
  advancedAnalytics: false,
  unlimitedPrograms: false,
} as const;

export type Feature = keyof typeof FEATURES;

/** Retourne `true` si la feature est activée. */
export const isEnabled = (feature: Feature): boolean => FEATURES[feature];
