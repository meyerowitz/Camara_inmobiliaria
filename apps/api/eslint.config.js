import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Archivos a ignorar
  {
    ignores: ['dist/**', 'node_modules/**']
  },

  // ── JavaScript ─────────────────────────────────────────
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      sourceType: 'module'
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }]
    }
  },

  // ── TypeScript ─────────────────────────────────────────
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ['**/*.ts']
  })),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.node
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
]
