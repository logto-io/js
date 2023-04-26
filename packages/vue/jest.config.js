import baseConfig from '../../jest.config.js';

/** @type {import('jest').Config.} */
const config = {
  ...baseConfig,
  testEnvironment: 'jsdom',
};

export default config;
