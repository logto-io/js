import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/src'],
  collectCoverage: Boolean(process.env.CI),
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        sourceMaps: true,
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!(.*(nanoid|jose|ky|@silverhand))/)'],
};

export default config;
