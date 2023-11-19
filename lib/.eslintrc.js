module.exports = {
  env: {
    node: true,
    jest: true,
  },
  extends: [require.resolve('../.eslintrc.js')],
  overrides: [
    {
      files: ['**/*.test.ts'],
      rules: {
       '@typescript-eslint/no-unsafe-assignment': ['off']
      }
    },
  ],
};
