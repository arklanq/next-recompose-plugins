const path = require('node:path');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

const monorepoRootDirPath = path.resolve(__dirname, '../..');

/**
 * @type {import('eslint').Linter.FlatConfig}
 */
const config = {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      // ESLint doesn't supply ecmaVersion in `parser.js` `context.parserOptions`
      // This is required to avoid ecmaVersion < 2015 error or 'import' / 'export' error
      sourceType: 'module',
      ecmaVersion: 'latest',
      project: './{lib,test-applications/*}/tsconfig.json',
      tsconfigRootDir: monorepoRootDirPath,
      warnOnUnsupportedTypeScriptVersion: true,
      emitDecoratorMetadata: false,
    },
  },
  plugins: {
    '@typescript-eslint': typescriptPlugin,
  },
  rules: {
    // Inject rules from `@typescript-eslint/eslint-plugin` plugin's recommended configs
    ...typescriptPlugin.configs['eslint-recommended'].overrides[0].rules,
    ...typescriptPlugin.configs['recommended'].rules,
    ...typescriptPlugin.configs['recommended-type-checked'].rules,

    // Don't leave floating Promises in the codebase. If needed explicitly mark them with `void` operator.
    '@typescript-eslint/no-floating-promises': ['warn', {ignoreVoid: true}],
    // Allow unused vars with leading underscore
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_', // Ignore args starting with underscore
        args: 'none',
        ignoreRestSiblings: true,
      },
    ],
    // Don't ban `object` type as Record<string, unknown> is not always the best solution
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {object: false},
      },
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
    // It should be definetly a warning, instead of an error
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    // Disallow inline type import by error https://github.com/rollup/plugins/issues/1588
    '@typescript-eslint/no-import-type-side-effects': 'error',
    // There is no way to tell this rule that the class' method is actually bound (i.e. via `@bind` decorator)
    '@typescript-eslint/unbound-method': 'off'
  },
};

module.exports = config;
