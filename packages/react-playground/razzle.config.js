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

    if (WITH_REPORT) {
      config.plugins = [...config.plugins, new BundleAnalyzerPlugin()];
    }

    return config;
  },
  modifyJestConfig: ({ jestConfig }) => {
    /** @type {import('@jest/types').Config.InitialOptions} **/
    const config = { ...jestConfig };

    config.moduleNameMapper = {
      ...config.moduleNameMapper,
      '^.+\\.(css|less|scss)$': 'babel-jest',
      '@/(.*)': '<rootDir>/src/$1',
    };

    return config;
  },
};
