import {defineConfig} from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import {join} from 'node:path';

/**
 * @type {import('rollup').RollupOptions[]}
 */
const config = defineConfig([
  {
    input: 'src/main.ts',
    output: {
      file: join(__dirname, './dist/cjs/main.js'),
      format: 'cjs',
    },
    plugins: [
      resolve(),
      typescript()
    ],
  },
  {
    input: 'src/main.ts',
    output: {
      dir: join(__dirname, 'dist/esm/'),
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    plugins: [
      resolve(),
      typescript({
        compilerOptions: {
          outDir: join(__dirname, 'dist/esm/'),
          noEmit: true,
          declaration: false
        },
      })
    ],
  }
]);

export default config;
