import type { Config } from '@jest/types';

import baseConfig from '../../jest.config';

const config: Config.InitialOptions = {
  ...baseConfig,
  testEnvironment: 'jsdom',
};

export default config;
