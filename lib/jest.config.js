import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as asyncFs from 'node:fs/promises';
import {pathsToModuleNameMapper} from 'ts-jest';
import tsJestPresets from 'ts-jest/presets/index.js';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const tsConfigFilePath = path.join(rootDir, 'tsconfig.test.json');
const tsconfig = await asyncFs.readFile(tsConfigFilePath, 'utf-8').then((content) => JSON.parse(content));

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const config = {
  rootDir,
  // roots: ['<rootDir>/src', '<rootDir>/test'],
  modulePaths: [tsconfig.compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {useESM: true}),
  moduleFileExtensions: ['js', 'ts', 'mjs'],
  extensionsToTreatAsEsm: ['.ts', '.mts'],
  testMatch: [path.join(rootDir, 'test/**/*.test.ts')],
  transform: {
    ...tsJestPresets.defaultsESM.transform,
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
};

export default config;
