const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = require('../metro.config.js');

/**
 * Le fichier `metro.config.js` doit **étendre** la configuration d'Expo, jamais
 * la remplacer.
 *
 * Une réassignation de `config.resolver` supprime silencieusement les dix-sept
 * réglages qu'Expo y place — dont `unstable_enablePackageExports` et
 * `unstable_conditionsByPlatform` — et rend la résolution des dépendances
 * dépendante de l'agencement exact de `node_modules`. Le symptôme apparaît
 * loin de la cause : « Unable to resolve "expo-asset" », sur une machine
 * seulement, au moment du bundling natif.
 */
describe('metro.config.js', () => {
  const base = getSentryExpoConfig(__dirname.replace(/\/__tests__$/, ''));

  it('conserve tous les réglages de résolution d’Expo', () => {
    for (const key of Object.keys(base.resolver)) {
      expect(config.resolver).toHaveProperty(key);
    }
  });

  it('conserve les réglages sensibles à la résolution des paquets', () => {
    expect(config.resolver.unstable_enablePackageExports).toBe(
      base.resolver.unstable_enablePackageExports,
    );
    expect(config.resolver.unstable_conditionsByPlatform).toEqual(
      base.resolver.unstable_conditionsByPlatform,
    );
    expect(config.resolver.resolverMainFields).toEqual(base.resolver.resolverMainFields);
  });

  it('bascule les SVG des ressources vers les sources', () => {
    // `react-native-svg-transformer` les compile en composants : ils ne doivent
    // plus être traités comme des fichiers à copier.
    expect(config.resolver.assetExts).not.toContain('svg');
    expect(config.resolver.sourceExts).toContain('svg');
  });

  it('conserve les autres extensions de ressources', () => {
    for (const ext of base.resolver.assetExts.filter((e) => e !== 'svg')) {
      expect(config.resolver.assetExts).toContain(ext);
    }
    // Les polices du design system en dépendent directement.
    expect(config.resolver.assetExts).toContain('ttf');
  });
});
