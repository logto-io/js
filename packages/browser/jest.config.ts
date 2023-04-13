import type { Config } from '@jest/types';

import baseConfig from '../../jest.config';

const config: Config.InitialOptions = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', 'jest-matcher-specific-error'],
};

export default config;
