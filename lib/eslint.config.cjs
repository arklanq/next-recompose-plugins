const globals = require('globals');
const baseConfig = require('../eslint.config.cjs');

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
const config = [
  ...baseConfig,

  // Global configuration
  {
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
        ...globals.jest,
      },
    }
  },

  // TypeScript code only
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        // ESLint doesn't supply ecmaVersion in `parser.js` `context.parserOptions`
        // This is required to avoid ecmaVersion < 2015 error or 'import' / 'export' error
        sourceType: 'module',
        ecmaVersion: 'latest',
        project: 'tsconfig.test.json', // overriden
        tsconfigRootDir: __dirname, // overriden
        warnOnUnsupportedTypeScriptVersion: true,
        emitDecoratorMetadata: false,
      },
    },
  },

  // Test code only
  {
    files: ['test/**/*'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': ['off']
    }
  }
];

module.exports = config;
