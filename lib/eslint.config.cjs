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
    languageOptions: {
      parserOptions: {
        project: './lib/tsconfig.test.json', // overriden
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
