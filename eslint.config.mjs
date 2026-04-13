// @ts-check
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

/**
 * DDD Layer Boundary Rules
 * - domain        : must not import from any other layer
 * - application   : may only import from domain (+ shared)
 * - infrastructure: may import from domain or application (+ shared)
 * - presentation  : may only import from application (+ shared)
 */

/** Glob patterns representing each DDD layer (applies to both modules/ and shared/) */
const layers = {
  domain: '**/domain/**',
  application: '**/application/**',
  infrastructure: '**/infrastructure/**',
  presentation: '**/presentation/**',
};

export default [
  // ─── Ignored paths ────────────────────────────────────────────────────────
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'prisma/**',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/__tests__/**',
    ],
  },

  // ─── TypeScript source files ──────────────────────────────────────────────
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // ── Extend recommended rules ─────────────────────────────────────────
      ...tseslint.configs.recommended.rules,

      // ── Unused variables / imports ───────────────────────────────────────
      // Flag any import that is declared but never used
      'no-unused-vars': 'off', // disabled in favour of the TypeScript-aware version below
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // ── Import order ─────────────────────────────────────────────────────
      // Enforce group order: builtin → external → internal → parent → sibling → index
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // node:path, node:fs …
            'external', // express, inversify …
            'internal', // @/* path aliases
            'parent', // ../
            'sibling', // ./
            'index', // ./index
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/first': 'error',
      'import/no-duplicates': 'error',

      // ── Function length (max 50 lines) ────────────────────────────────────
      'max-lines-per-function': [
        'warn',
        {
          max: 50,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // ─── DDD Layer: domain ────────────────────────────────────────────────────
  // Domain must not import from application, infrastructure, or presentation
  {
    files: ['src/**/domain/**/*.ts'],
    plugins: { '@typescript-eslint': tseslint, import: importPlugin },
    languageOptions: { parser: tsParser },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/application/**', '../application/**', './application/**'],
              message: '[DDD] The domain layer must not import from the application layer.',
            },
            {
              group: ['**/infrastructure/**', '../infrastructure/**', './infrastructure/**'],
              message: '[DDD] The domain layer must not import from the infrastructure layer.',
            },
            {
              group: ['**/presentation/**', '../presentation/**', './presentation/**'],
              message: '[DDD] The domain layer must not import from the presentation layer.',
            },
          ],
        },
      ],
    },
  },

  // ─── DDD Layer: application ───────────────────────────────────────────────
  // Application may only import from domain (and shared)
  {
    files: ['src/**/application/**/*.ts'],
    plugins: { '@typescript-eslint': tseslint, import: importPlugin },
    languageOptions: { parser: tsParser },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**', '../infrastructure/**', './infrastructure/**'],
              message: '[DDD] The application layer must not import from the infrastructure layer.',
            },
            {
              group: ['**/presentation/**', '../presentation/**', './presentation/**'],
              message: '[DDD] The application layer must not import from the presentation layer.',
            },
          ],
        },
      ],
    },
  },

  // ─── DDD Layer: infrastructure ────────────────────────────────────────────
  // Infrastructure may import from domain and application, but not from presentation
  {
    files: ['src/**/infrastructure/**/*.ts'],
    plugins: { '@typescript-eslint': tseslint, import: importPlugin },
    languageOptions: { parser: tsParser },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/presentation/**', '../presentation/**', './presentation/**'],
              message:
                '[DDD] The infrastructure layer must not import from the presentation layer.',
            },
          ],
        },
      ],
    },
  },

  // ─── DDD Layer: presentation ──────────────────────────────────────────────
  // Presentation may only import from application (and shared);
  // direct imports from domain or infrastructure are forbidden
  {
    files: ['src/**/presentation/**/*.ts'],
    plugins: { '@typescript-eslint': tseslint, import: importPlugin },
    languageOptions: { parser: tsParser },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/domain/**', '../domain/**', './domain/**'],
              message:
                '[DDD] The presentation layer must not import directly from the domain layer. Use the application layer instead.',
            },
            {
              group: ['**/infrastructure/**', '../infrastructure/**', './infrastructure/**'],
              message:
                '[DDD] The presentation layer must not import from the infrastructure layer.',
            },
          ],
        },
      ],
    },
  },
];
