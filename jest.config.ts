/* cspell:ignore lcov */
/* eslint-disable import/no-default-export */

import type { Config } from '@jest/types';

const configuration: Config.InitialOptions = {
  cacheDirectory: '<rootDir>/.cache/jest',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageProvider: 'babel',
  coverageReporters: ['lcov', 'text', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  logHeapUsage: true,
  restoreMocks: true,
  roots: ['<rootDir>/__mocks__', '<rootDir>/src'],
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/grpc-rich-error-model'],
};

export default configuration;
