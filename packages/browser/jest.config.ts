import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest/presets/js-with-ts',
  collectCoverageFrom: ['src/**/*.ts'],
  coverageReporters: ['lcov', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', 'jest-matcher-specific-error'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['node_modules/(?!(.*(nanoid|jose|ky|@logto|@silverhand))/)'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
};

export default config;
