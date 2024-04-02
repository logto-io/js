import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import dotenv from 'rollup-plugin-dotenv';

/**
 * @type {import('rollup').RollupOptions}
 */
const configs = {
  input: ['src/index.tsx', 'src/service-worker.ts'],
  output: [
    {
      format: 'esm',
      dir: 'dist',
    },
  ],
  external: ['./service-worker.js', /node:/],
  plugins: [
    dotenv(),
    typescript({ tsconfig: 'tsconfig.json' }),
    nodeResolve({ browser: true }),
    copy({ targets: [{ src: 'static/*', dest: 'dist' }] }),
  ],
};

export default configs;
