const path = require('path');

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = () => {
  const { WITH_REPORT } = process.env;

  return {
    mode: 'production',
    entry: './lib/index.js',
    output: {
      filename: 'logto-browser.min.js',
      path: path.resolve(__dirname, 'lib'),
    },
    plugins: WITH_REPORT ? [new BundleAnalyzerPlugin()] : [],
  };
};
