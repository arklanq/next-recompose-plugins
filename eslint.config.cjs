const eslintStockPlugin = require('@eslint/js');
const eslintConfigPrettier = require('eslint-config-prettier');
const globalConfig = require('./.config/eslint/global-config.js');
const tsConfig = require('./.config/eslint/ts-config.js');

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
const config = [
  // Global configuration
  globalConfig,

  // ESLint recommended config
  eslintStockPlugin.configs.recommended,

  // TypeScript code only
  tsConfig,

  // Turns off all rules that are unnecessary or might conflict with Prettier
  eslintConfigPrettier
];

module.exports = config;
