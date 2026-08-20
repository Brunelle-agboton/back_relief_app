module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  // Aligné sur le préréglage de jest-expo. La liste précédente exigeait un `/`
  // après chaque nom (`expo/`, `@expo/`…), si bien que `expo-font` — dont
  // dépend `@expo/vector-icons` — restait non transpilé : toute suite important
  // une icône échouait au parsing. Cette version est un sur-ensemble de la
  // précédente et rétablit l'intention du préréglage.
  transformIgnorePatterns: [
    '/node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-clone-referenced-element)',
    '/node_modules/react-native-reanimated/plugin/',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/__tests__/helpers/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
};
