import baseConfigs from '../../rollup.config.js';

const configs = {
  ...baseConfigs,
  input: ['src/index.ts', 'edge/index.ts', 'server-actions/index.ts'],
};

export default configs;
