import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { summary } from 'rollup-plugin-summary';

/**
 * @type {import('rollup').OutputOptions}
 */
const configs = {
  input: ['src/index.ts'],
  output: [
    { format: 'cjs', dir: 'lib', preserveModules: true, exports: 'named', interop: 'auto' },
    { dir: 'lib', preserveModules: true, entryFileNames: '[name].mjs' },
  ],
  plugins: [typescript({ tsconfig: 'tsconfig.build.json' }), nodeResolve(), summary()],
  external: [/node_modules/, /@logto/],
};

export default configs;
