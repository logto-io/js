import baseConfigs from '../../rollup.config.mjs';

const configs = {
  ...baseConfigs,
  input: ['src/index.ts', 'edge/index.ts'],
};

export default configs;
