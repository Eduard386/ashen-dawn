module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    '@typescript-eslint/recommended',
    'plugin:jest/recommended'
  ],
  plugins: ['@typescript-eslint', 'jest'],
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true
  },
  rules: {
    'no-magic-numbers': ['error', { ignore: [0, 1, -1, 100] }],
    'prefer-const': 'error',
    'no-var': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'off', // Allow during migration
    '@typescript-eslint/no-unused-vars': 'warn'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  }
};
