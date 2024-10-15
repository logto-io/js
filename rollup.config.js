import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { summary } from 'rollup-plugin-summary';

/**
 * @type {import('rollup').RollupOptions}
 */
const configs = {
  input: ['src/index.ts'],
  output: [
    {
      format: 'esm',
      dir: 'lib',
      preserveModules: true,
      exports: 'named',
      entryFileNames: '[name].js',
      interop: 'auto',
    },
    { dir: 'lib', preserveModules: true },
  ],
  plugins: [typescript({ tsconfig: 'tsconfig.build.json' }), nodeResolve(), summary()],
  external: [/node_modules/, /@logto/],
};

export default configs;
