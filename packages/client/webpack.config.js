const path = require('path');

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = () => {
  const { WITH_REPORT } = process.env;

  return {
    entry: './src/index.ts',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'logto.min.js',
      path: path.resolve(__dirname, 'dist'),
      library: 'logto',
      libraryTarget: 'umd',
    },
    mode: 'production',
    plugins: WITH_REPORT ? [new BundleAnalyzerPlugin()] : [],
  };
};
