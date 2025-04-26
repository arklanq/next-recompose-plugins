const path = require('node:path');
const tseslint = require('typescript-eslint');

const monorepoRootDirPath = path.resolve(__dirname, '../..');

const config = tseslint.config(
  tseslint.configs.base,
  tseslint.configs.eslintRecommended,
  tseslint.configs.recommendedTypeChecked[tseslint.configs.recommendedTypeChecked.length - 1],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: monorepoRootDirPath
      }
    },
    rules: {
      /*
       * Disallow inline type import in some cases, see:
       * - https://github.com/rollup/plugins/issues/1588
       * - https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax
       */
      '@typescript-eslint/no-import-type-side-effects': 'error',
      // Allow unused vars with leading underscore
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_', // Ignore args starting with underscore
          args: 'none',
          ignoreRestSiblings: true
        }
      ],
      // Require explicit accessibility modifiers on class properties and methods
      '@typescript-eslint/explicit-member-accessibility': 'error',
      // Annoying if used on purpose
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Allow explicit type declarations everywhere
      '@typescript-eslint/no-inferrable-types': 'off',
      // TypeScript's `noFallthroughCasesInSwitch` option is more robust
      'no-fallthrough': 'off',
      'default-case': 'off',
      // Disable explicit function return types
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Don't leave floating Promises in the codebase. If needed explicitly mark them with `void` operator.
      '@typescript-eslint/no-floating-promises': ['warn', {ignoreVoid: true}],
      // It should be definetly a warning, instead of an error
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      // Don't check functions that return promises where a void return is expected
      '@typescript-eslint/no-misused-promises': ['error', {checksVoidReturn: false}],
      // There is no way to tell this rule that the class' method is actually bound (i.e. via `@bind` decorator)
      '@typescript-eslint/unbound-method': 'off'
    }
  }
);

module.exports = config;
