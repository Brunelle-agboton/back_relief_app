module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|expo(nent)?|expo-router)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/build/','/__tests__/helpers/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
