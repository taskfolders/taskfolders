module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:n/recommended',
    'plugin:import/recommended',
  ],
  ignorePatterns: ['packages/*/dist/**'],
  rules: {
    // TODO review
    'no-undef': 0,
    'no-empty': 0,
    'no-unreachable': 0,
    'no-constant-condition': 0,
    '@typescript-eslint/no-this-alias': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    'no-control-regex': 0,

    // TODO review imports
    'import/no-unresolved': 0,

    // GROUP stay
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/ban-types': 0,
    'prefer-const': 0,

    //
    // "n/file-extension-in-import": [
    //   "error",
    //   "always",
    //   {
    //     "tryExtensions": [".js"],
    //     ".ts": "never",
    //     ".xxx": "never"
    //   }
    // ],

    'n/no-extraneous-import': 0,
    'n/no-unsupported-features/es-syntax': 0,
    'n/no-missing-import': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'always',
        ts: 'never',
        mjs: 'always',
      },
    ],
  },
}
