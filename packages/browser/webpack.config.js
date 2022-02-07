const path = require('path');

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = () => {
  const { WITH_REPORT } = process.env;

  return {
    mode: 'production',
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'logto.browser.min.js',
      library: {
        type: 'umd',
        name: 'logto',
      },
    },
    module: {
      rules: [
        {
          exclude: /node_modules/,
          use: 'ts-loader',
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    plugins: WITH_REPORT ? [new BundleAnalyzerPlugin()] : [],
  };
};
