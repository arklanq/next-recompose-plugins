module.exports = {
  extends: [require.resolve('../.eslintrc.js')],
  env: {
    node: true,
    jest: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['test/**/*'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': ['off']
      }
    },
  ],
};
