import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ["<rootDir>/src"],
  collectCoverage: Boolean(process.env.CI),
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        sourceMaps: true,
      },
    ],
  }
};

export default config;
