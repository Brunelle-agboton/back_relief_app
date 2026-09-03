import { isEnabled } from '@/config/featureFlags';

/**
 * Décision d'accès à l'espace praticien.
 *
 * Le drapeau `proDashboard` n'était vérifié qu'à la connexion : un praticien y
 * était bien renvoyé vers l'espace patient, mais rien n'empêchait d'arriver sur
 * une route `(pro)` autrement — reprise de navigation en développement, lien
 * direct, ou simple retour arrière. L'espace praticien n'offrant ni
 * déconnexion ni retour vers l'espace patient, on s'y retrouvait enfermé.
 */
export type ProAccess =
  /** Session encore en cours de lecture : ne rien décider. */
  | 'pending'
  /** Pas de session : renvoyer vers l'accueil public. */
  | 'anonymous'
  /** Session valide, mais l'espace praticien n'est pas ouvert à cet utilisateur. */
  | 'patient'
  | 'allowed';

export interface ProAccessInput {
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string | undefined;
}

export function resolveProAccess({ isLoading, isAuthenticated, role }: ProAccessInput): ProAccess {
  if (isLoading) {
    return 'pending';
  }
  if (!isAuthenticated) {
    return 'anonymous';
  }
  if (!isEnabled('proDashboard') || role !== 'practitioner') {
    return 'patient';
  }
  return 'allowed';
}
