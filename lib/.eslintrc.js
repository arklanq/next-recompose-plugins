module.exports = {
  env: {
    node: true,
    jest: true,
  },
  extends: [require.resolve('../.eslintrc.js')],
  overrides: [
    {
      files: ['**/*.@(spec|test).ts?(x)'],
      rules: {
       '@typescript-eslint/no-unsafe-assignment': ['off']
      }
    },
  ],
};
