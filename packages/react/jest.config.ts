import type { Config } from '@jest/types';

import baseConfig from '../../jest.config.js';

const config: Config.InitialOptions = {
  ...baseConfig,
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        sourceMaps: true,
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  testEnvironment: 'jsdom',
};

export default config;
