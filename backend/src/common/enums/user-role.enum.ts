/**
 * Rôles applicatifs. La valeur est celle stockée en base dans `user.role`.
 *
 * Le rôle n'est JAMAIS accepté depuis une requête cliente (cf. SEC-03) :
 * il est décidé côté serveur par la route d'inscription utilisée.
 */
export enum UserRole {
  USER = 'user',
  PRACTITIONER = 'practitioner',
  ADMIN = 'admin',
}
