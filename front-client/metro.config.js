const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Les SVG passent du côté des sources pour être transformés en composants
// plutôt que servis comme fichiers.
//
// Les deux clés sont modifiées en place, et non par réassignation de
// `config.resolver` : Expo y place dix-sept réglages — dont
// `unstable_enablePackageExports`, `unstable_conditionsByPlatform` et
// `resolverMainFields` — qu'un écrasement supprimait silencieusement, rendant
// la résolution des dépendances dépendante de l'agencement de node_modules.
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
