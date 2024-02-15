import defaultConfig from '../../rollup.config.js';

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  ...defaultConfig,
  input: ['src/index.ts', 'src/shim.ts'],
};

export default config;
