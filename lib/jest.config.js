/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'ts'],
  testRegex: '.*\\.test\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
