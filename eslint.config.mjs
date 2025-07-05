// eslint.config.js
import globals from 'globals'

import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import nPlugin from 'eslint-plugin-n'
import importPlugin from 'eslint-plugin-import'

export default [
  // Base JS recommended rules
  js.configs.recommended,

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        console: 'writable',
        __dirname: 'readable',
        __filename: 'readable',
        process: 'readable',

        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      n: nPlugin,
      import: importPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...nPlugin.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,

      // Your custom rule overrides
      'no-undef': 0,
      'no-empty': 0,
      'no-unused-vars': 0,
      'no-unreachable': 0,
      'no-constant-condition': 0,
      '@typescript-eslint/no-this-alias': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      'no-control-regex': 0,

      'import/no-unresolved': 0,

      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/ban-types': 0,
      'prefer-const': 0,

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
  },

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 0,
    },
  },

  // Ignore patterns
  {
    ignores: ['packages/*/dist/**'],
  },
]
