/** @type {import('@jest/types').Config} */
const config = {
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
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default config;
