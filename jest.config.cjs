/**
 * Jest configuration for TypeScript + React
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    "\\.(gif|ttf|eot|svg|png|jpg|jpeg)$": '<rootDir>/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  // Ignore directories used by e2e tests and build artifacts
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/playwright/', '/tests/', '/amplify/'],
  // Only run tests located under src (unit tests)
  testMatch: ['**/src/**/?(*.)+(spec|test).[tj]s?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
