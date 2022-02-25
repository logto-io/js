import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.ts'],
  coverageReporters: ['lcov', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', 'jest-matcher-specific-error'],
  testEnvironment: 'jsdom',
};

export default config;
