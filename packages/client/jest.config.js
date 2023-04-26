import baseConfig from '../../jest.config.js';

/** @type {import('jest').Config} */
const config = {
  ...baseConfig,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', 'jest-matcher-specific-error'],
};

export default config;
