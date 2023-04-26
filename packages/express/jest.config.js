import baseConfig from '../../jest.config.js';

/** @type {import('jest').Config} */
const config = {
  ...baseConfig,
  setupFilesAfterEnv: ['jest-matcher-specific-error'],
};

export default config;
