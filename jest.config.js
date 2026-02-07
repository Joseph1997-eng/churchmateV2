module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|expo(nent)?|@expo(nent)?/.*|@react-native-community|@react-native-async-storage|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@expo/vector-icons)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/index.ts'],
};
