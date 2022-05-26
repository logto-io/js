import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.{ts|tsx}'],
  coverageReporters: ['lcov', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  transform: {
    '\\.(ts|js)x?$': 'ts-jest',
  },
};

export default config;
