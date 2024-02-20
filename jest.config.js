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
  transformIgnorePatterns: ['node_modules/(?!(.*(nanoid|jose|ky|@silverhand|p-.*))/)'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '@sveltejs/kit': '<rootDir>/node_modules/@sveltejs/kit/src/exports/index.js', // Jest can't handle sveltekit's exports
  },
};

export default config;
