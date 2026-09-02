/**
 * MET-11 : lecture défensive de `Activity.metadata`.
 *
 * La colonne est un texte libre alimenté par le client. Un `JSON.parse` nu
 * suffisait à faire tomber en 500 les routes /summary et /health/pains-latest
 * dès qu'une seule ligne d'historique était malformée — une donnée d'un
 * utilisateur cassait alors tout son tableau de bord.
 */
export interface ActivityMetadata {
  exerciceId?: string;
  lineOrder?: number;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseActivityMetadata(
  raw: string | null | undefined,
): ActivityMetadata {
  if (!raw) {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }

  if (!parsed || typeof parsed !== 'object') {
    return {};
  }

  const { exerciceId, lineOrder } = parsed as Record<string, unknown>;

  /**
   * Depuis le passage des clés primaires en `uuid`, `exerciceId` alimente
   * directement une colonne uuid. Une valeur arbitraire écrite par le client
   * (« abc », un ancien identifiant numérique…) faisait échouer la requête
   * PostgreSQL et renvoyait un 500 — exactement le défaut que MET-11 corrigeait
   * pour le JSON malformé. Le champ n'est conservé que s'il a la forme d'un
   * UUID ; sinon l'exercice est simplement considéré comme introuvable.
   */
  return {
    exerciceId:
      typeof exerciceId === 'string' && UUID_PATTERN.test(exerciceId)
        ? exerciceId
        : undefined,
    lineOrder: typeof lineOrder === 'number' ? lineOrder : undefined,
  };
}
