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
