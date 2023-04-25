import type { Config } from '@jest/types';

import baseConfig from '../../jest.config.js';

const config: Config.InitialOptions = {
  ...baseConfig,
  setupFilesAfterEnv: ['jest-matcher-specific-error'],
};

export default config;
