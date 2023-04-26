import baseConfig from '../../jest.config.js';

/** @type {import('jest').Config} */
const config = {
  ...baseConfig,
  testEnvironment: './FixJsdomEnvironment.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', 'jest-matcher-specific-error'],
};

export default config;
