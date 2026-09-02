/**
 * SEC-04 : `GET /practitioner-profile/by-email/:email` doit rester accessible
 * sans jeton (le parcours d'inscription praticien l'appelle avant toute
 * connexion), mais il permettait d'énumérer les adresses e-mail des praticiens :
 * un 200 confirmait l'existence du compte, un 404 son absence.
 *
 * La route est donc restreinte à une liste blanche d'adresses explicitement
 * publiées par l'exploitant (`PUBLIC_PRACTITIONER_EMAILS`). Toute adresse hors
 * liste reçoit un 404 sans que la base ne soit interrogée : la réponse ne
 * dépend plus de l'existence du compte.
 *
 * Variable vide (valeur par défaut) ⇒ aucune adresse n'est interrogeable.
 */
export function getPublicPractitionerEmails(): string[] {
  return (process.env.PUBLIC_PRACTITIONER_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isPubliclyListedPractitioner(email: string): boolean {
  return getPublicPractitionerEmails().includes(email.trim().toLowerCase());
}

/**
 * Praticien avec lequel un nouveau professionnel prend son rendez-vous
 * d'accueil.
 *
 * Il était jusqu'ici désigné par l'identifiant numérique `1` codé en dur dans
 * AuthService. Avec des clés primaires UUID, cet identifiant n'est plus
 * devinable ni stable d'un environnement à l'autre : le praticien est désormais
 * résolu par son adresse e-mail, tirée de ONBOARDING_PRACTITIONER_EMAIL ou, à
 * défaut, de la première entrée de PUBLIC_PRACTITIONER_EMAILS.
 */
export function getOnboardingPractitionerEmail(): string | null {
  const dedicated = (process.env.ONBOARDING_PRACTITIONER_EMAIL ?? '').trim();
  if (dedicated) {
    return dedicated.toLowerCase();
  }
  return getPublicPractitionerEmails()[0] ?? null;
}
