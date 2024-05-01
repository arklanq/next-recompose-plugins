import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
import {defineConfig} from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import {writePackage} from 'write-pkg';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(rootDir, 'package.json')));


const externalPackages = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

function generatePackageJson(properties = {}) {
  return {
    name: 'generate-package-json',
    generateBundle: async (outputOptions) => {
      const outputPath = outputOptions.dir || path.dirname(outputOptions.file);
      await writePackage(outputPath, properties, {indent: 2});
    }
  };
}

/**
 * @type {import('rollup').RollupOptions[]}
 */
const config = defineConfig([
  // CJS bundle
  {
    input: 'src/main.ts',
    output: {
      dir: path.join(rootDir, './dist/cjs/'),
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    external: externalPackages.map(packageName => new RegExp(`^${packageName}(/.*)?`)),
    plugins: [
      resolve({
        extensions: ['.cts', '.ts'],
        mainFields: ['main', 'module'],
        exportConditions: ['import', 'module', 'default']
      }),
      commonjs(),
      json(),
      // Emits .js
      typescript({
        tsconfig: path.join(rootDir, 'tsconfig.src.json'),
        compilerOptions: {
          module: 'esnext',
          outDir: path.join(rootDir, './dist/cjs/'),
          noEmit: false,
          declaration: false,
        },
        exclude: ['**/*.test.ts', '**/__mocks__/**/*', 'setupTests.ts']
      }),
      // Emits .d.ts
      typescript({
        tsconfig: path.join(rootDir, 'tsconfig.src.json'),
        compilerOptions: {
          module: 'esnext',
          outDir: path.join(rootDir, './dist/cjs/'),
          noEmit: false,
          declaration: true,
          emitDeclarationOnly: true,
        },
        exclude: ['**/*.test.ts', '**/__mocks__/**/*', 'setupTests.ts']
      }),
      generatePackageJson({
        'type': 'commonjs'
      }),
    ],
  },
  // ESM bundle
  {
    input: 'src/main.ts',
    output: {
      dir: path.join(rootDir, './dist/esm/'),
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    external: externalPackages.map(packageName => new RegExp(`^${packageName}(/.*)?`)),
    plugins: [
      resolve({
        extensions: ['.mts', '.ts'],
        mainFields: ['module', 'main'],
        exportConditions: ['require', 'node', 'default']
      }),
      commonjs(),
      json(),
      // Emits .js
      typescript({
        tsconfig: path.join(rootDir, 'tsconfig.src.json'),
        compilerOptions: {
          module: 'esnext',
          outDir: path.join(rootDir, './dist/esm/'),
          noEmit: false,
          declaration: false,
        },
        exclude: ['**/*.test.ts', '**/__mocks__/**/*', 'setupTests.ts']
      }),
      // Emits .d.ts
      typescript({
        tsconfig: path.join(rootDir, 'tsconfig.src.json'),
        compilerOptions: {
          module: 'esnext',
          outDir: path.join(rootDir, './dist/esm/'),
          noEmit: false,
          declaration: true,
          emitDeclarationOnly: true,
        },
        exclude: ['**/*.test.ts', '**/__mocks__/**/*', 'setupTests.ts']
      }),
      generatePackageJson({
        'type': 'module'
      }),
    ],
  }
]);

export default config;
