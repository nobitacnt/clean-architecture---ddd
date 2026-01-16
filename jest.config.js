module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/index.ts',
    '!src/main.ts',
    '!src/server.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  coverageDirectory: 'coverage',
  verbose: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '\\.interface\\.ts$',
    '\\.dto\\.ts$',
    '\\.input\\.ts$',
    '\\.schema\\.ts$',
    '\\.const\\.ts$',
  ],
};
