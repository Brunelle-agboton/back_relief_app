/**
 * MET-11 : lecture défensive de `Activity.metadata`.
 *
 * La colonne est un texte libre alimenté par le client. Un `JSON.parse` nu
 * suffisait à faire tomber en 500 les routes /summary et /health/pains-latest
 * dès qu'une seule ligne d'historique était malformée — une donnée d'un
 * utilisateur cassait alors tout son tableau de bord.
 */
export interface ActivityMetadata {
  exerciceId?: number;
  lineOrder?: number;
}

export function parseActivityMetadata(
  raw: string | null | undefined,
): ActivityMetadata {
  if (!raw) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object'
      ? (parsed as ActivityMetadata)
      : {};
  } catch {
    return {};
  }
}
