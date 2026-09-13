import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { defaultAmbiance, themes } from '@/theme';

/**
 * Les familles déclarées par le thème doivent être chargées par
 * `app/_layout.tsx`, et pointer vers un fichier existant.
 *
 * C'est une vérification qu'aucun autre test ne peut faire : une famille mal
 * orthographiée ne lève aucune erreur à l'exécution — React Native retombe
 * silencieusement sur la police système, et le décalage ne se voit qu'à l'œil,
 * sur un appareil.
 */
describe('polices embarquées', () => {
  const layout = readFileSync(join(process.cwd(), 'app', '_layout.tsx'), 'utf-8');

  /** Paires `famille → fichier` déclarées dans l'appel à `useFonts`. */
  const declared = new Map<string, string>(
    [...layout.matchAll(/'?([\w-]+)'?:\s*require\('([^']+\.ttf)'\)/g)].map(
      ([, family, path]) => [family, path] as const,
    ),
  );

  const { fonts } = themes[defaultAmbiance].light;
  const families = [
    ...new Set([...Object.values(fonts.display), ...Object.values(fonts.body), fonts.mono]),
  ];

  it('déclare toutes les familles du thème', () => {
    expect(families.length).toBeGreaterThanOrEqual(7);
    for (const family of families) {
      expect([...declared.keys()]).toContain(family);
    }
  });

  it.each(families)('%s pointe vers un fichier existant', (family) => {
    const relative = declared.get(family);
    expect(relative).toBeDefined();
    // Les chemins de `app/_layout.tsx` sont relatifs à `app/`.
    expect(existsSync(join(process.cwd(), 'app', relative as string))).toBe(true);
  });
});
