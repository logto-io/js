'use strict';

const path = require('path');

module.exports = {
  options: {
    buildType: 'spa',
  },
  plugins: ['scss'],
  modifyWebpackConfig: ({ webpackConfig }) => {
    /** @type {import('webpack').Configuration} **/
    const config = { ...webpackConfig };

    config.resolve.alias = {
      '@': path.resolve('src/'),
    };

    // Playground exceed the 244kb limitation after import client
    // create a issue to optimize client js SDK package size
    // https://linear.app/silverhand/issue/LOG-236/need-to-reduce-the-client-package-size
    config.performance = {
      hints: 'warning'
    };

    return config;
  },
  modifyJestConfig: ({ jestConfig }) => {
    /** @type {import('@jest/types').Config.InitialOptions} **/
    const config = { ...jestConfig };

    config.transformIgnorePatterns = [
      '^.+\\.module\\.(css|sass|scss)$',
      '[/\\\\]node_modules[/\\\\]((?!ky[/\\\\]).)+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    ];

    config.moduleNameMapper = {
      ...config.moduleNameMapper,
      '^.+\\.(css|less|scss)$': 'babel-jest',
      '@/(.*)': '<rootDir>/src/$1',
    };

    config.setupFilesAfterEnv =['./jest.setup.js'];

    return config;
  },
};
