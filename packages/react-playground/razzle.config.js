'use strict';

const path = require('path');

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  options: {
    buildType: 'spa',
  },
  plugins: ['scss'],
  modifyWebpackConfig: ({ webpackConfig }) => {
    /** @type {import('webpack').Configuration} **/
    const config = { ...webpackConfig };
    const { WITH_REPORT } = process.env;

    config.resolve.alias = {
      '@': path.resolve('src/'),
    };

    // Playground exceed the 244kb limitation after import client
    // create a issue to optimize client js SDK package size
    // https://linear.app/silverhand/issue/LOG-236/need-to-reduce-the-client-package-size
    config.performance = {
      maxEntrypointSize: 394000,
      maxAssetSize: 394000,
    };

    if (WITH_REPORT) {
      config.plugins = [...config.plugins, new BundleAnalyzerPlugin()];
    }

    return config;
  },
  modifyJestConfig: ({ jestConfig }) => {
    /** @type {import('@jest/types').Config.InitialOptions} **/
    const config = {
      ...jestConfig,
      setupFilesAfterEnv: ['./jest.setup.js'],
      collectCoverageFrom: ['**/*.{ts, tsx, js}', '!**/node_modules/**', '!**/lib/**'],
      coverageReporters: ['json', 'html'],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        './src/**/*.{ts,tsx,js}': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    };

    config.moduleNameMapper = {
      ...config.moduleNameMapper,
      '^.+\\.(css|less|scss)$': 'babel-jest',
      '@/(.*)': '<rootDir>/src/$1',
    };

    return config;
  },
};
