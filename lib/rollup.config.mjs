import {defineConfig} from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';

const rootDir = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json')));


const externalPackages = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const sharedPlugins = [
  resolve(),
  commonjs(),
  json(),
  typescript({
    compilerOptions: {
      outDir: join(rootDir, 'dist/esm/'),
      noEmit: true,
      declaration: false
    },
  })
];

/**
 * @type {import('rollup').RollupOptions[]}
 */
const config = defineConfig([
  {
    input: 'src/main.ts',
    output: {
      file: join(rootDir, './dist/cjs/main.js'),
      format: 'cjs',
    },
    external: externalPackages.map(packageName => new RegExp(`^${packageName}(\/.*)?`)),
    plugins: [
      ...sharedPlugins
    ],
  },
  {
    input: 'src/main.ts',
    output: {
      dir: join(rootDir, 'dist/esm/'),
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    external: externalPackages.map(packageName => new RegExp(`^${packageName}(\/.*)?`)),
    plugins: [
      ...sharedPlugins
    ],
  }
]);

export default config;
