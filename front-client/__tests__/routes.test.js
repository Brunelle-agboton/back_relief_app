const fs = require('fs');
const path = require('path');

/**
 * Vérifie que chaque destination de navigation écrite en clair correspond à un
 * écran existant.
 *
 * Une route inexistante ne lève rien de visible : expo-router se contente de ne
 * pas naviguer, ou retombe sur `+not-found`. Sur un garde du type « pas de
 * jeton, retour à la connexion », l'utilisateur se retrouve alors coincé sur
 * l'écran courant sans explication — c'est précisément ce qui empêchait
 * d'atteindre la page de connexion depuis les informations de profil et depuis
 * l'onglet Progression.
 */

/**
 * Destinations connues comme dormantes, tolérées jusqu'à réactivation.
 * `asyncConsultation` est à `false` dans `config/featureFlags.ts` : la
 * téléconsultation a été sortie du périmètre V1, écrans compris.
 */
const DORMANT = new Set(['/teleconsultation/async-request']);

const APP_DIR = path.join(process.cwd(), 'app');

function screenFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__') screenFiles(full, acc);
    } else if (/\.tsx?$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

/**
 * Routes servies par un fichier, avec et sans ses segments de groupe : dans
 * expo-router, `app/(auth)/login.tsx` répond aussi bien à `/(auth)/login` qu'à
 * `/login`.
 */
function routesFor(file) {
  const base = path.basename(file);
  if (base.startsWith('_layout') || base.startsWith('+')) return [];

  const relative = path.relative(APP_DIR, file).replace(/\\/g, '/');
  const route = ('/' + relative.replace(/\.tsx?$/, '')).replace(/\/index$/, '') || '/';
  const groups = [...route.matchAll(/\/\([^)]+\)/g)].map((match) => match[0]);

  const variants = new Set([route]);
  for (let mask = 1; mask < 1 << groups.length; mask += 1) {
    let variant = route;
    groups.forEach((group, index) => {
      if (mask & (1 << index)) variant = variant.replace(group, '');
    });
    variants.add(variant || '/');
  }
  return [...variants];
}

const files = screenFiles(APP_DIR);
const known = new Set(files.flatMap(routesFor));

/** Destinations littérales — les chemins construits dynamiquement sont ignorés. */
const NAVIGATION = /(?:router\.(?:push|replace|navigate)|href=)\s*\(?\s*["'`](\/[^"'`${]*)["'`]/g;

const targets = files.flatMap((file) =>
  [...fs.readFileSync(file, 'utf-8').matchAll(NAVIGATION)].map((match) => ({
    file: path.relative(process.cwd(), file),
    target: match[1].replace(/\?.*$/, ''),
  })),
);

describe('destinations de navigation', () => {
  it('trouve les écrans du projet', () => {
    // Garde-fou sur l'analyse elle-même : un chemin cassé rendrait le test
    // vert sans rien vérifier.
    expect(known.has('/(auth)/login')).toBe(true);
    expect(known.has('/login')).toBe(true);
    expect(known.has('/_home')).toBe(true);
    expect(targets.length).toBeGreaterThan(10);
  });

  it('ne pointe vers aucun écran inexistant', () => {
    const dead = targets
      .filter(({ target }) => !known.has(target) && !DORMANT.has(target))
      .map(({ file, target }) => `${file} → ${target}`);

    expect([...new Set(dead)]).toEqual([]);
  });
});
