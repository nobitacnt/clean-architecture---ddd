module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // ── Coverage collection ───────────────────────────────────────────────────
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/index.ts',
    '!src/main.ts',
    '!src/server.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '\\.interface\\.ts$',
    '\\.dto\\.ts$',
    '\\.input\\.ts$',
    '\\.schema\\.ts$',
    '\\.const\\.ts$',
  ],
  coverageDirectory: 'coverage',

  // Reporters: lcov for SonarQube, text-summary for terminal, html for local browsing
  coverageReporters: ['lcov', 'text-summary', 'html'],

  // Minimum coverage thresholds — build fails if any metric drops below these values.
  // Current baseline reflects the existing test suite; raise these incrementally as coverage improves.
  coverageThreshold: {
    global: {
      lines: 20,
      functions: 25,
      branches: 35,
      statements: 20,
    },
  },

  // ── CI mode ───────────────────────────────────────────────────────────────
  // Detected automatically when process.env.CI is set (GitHub Actions, GitLab CI, etc.)
  // Forces: no watch mode, deterministic test ordering, full output
  ci: true,

  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  verbose: true,
};
