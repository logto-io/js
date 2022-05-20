import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.ts'],
  coverageReporters: ['lcov', 'text-summary'],
  testEnvironment: 'jsdom',
};

export default config;
