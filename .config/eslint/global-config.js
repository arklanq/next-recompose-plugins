const globals = require('globals');

/**
 * @type {import('eslint').Linter.FlatConfig}
 */
const config = {
  ignores: [
    '.git/',
    '.idea/',
    '.vscode/',
    '**/node_modules/',
    'lib/dist/',
    'test-applications/*/.next/'
  ],
  linterOptions: {
    reportUnusedDisableDirectives: true,
  },
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      ...globals.nodeBuiltin,
    },
  },
};

module.exports = config;
