module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  transformIgnorePatterns: [
  'node_modules/(?!(expo|@expo|expo-modules-core|@react-native|react-native|react-clone-referenced-element|expo-router|expo-secure-store|@react-navigation)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/build/','/__tests__/helpers/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
  '^.+\\.[tj]sx?$': 'babel-jest',
},
};
