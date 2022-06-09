/* cspell:ignore builtins */

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

import packageJson from './package.json';

/**
 * @type {import('rollup').RollupOptions}
 */
const configuration = {
  cache: false,
  external: Object.keys(packageJson.dependencies ?? {}),
  input: './src/index.ts',
  strictDeprecations: true,
  plugins: [
    commonjs(),
    json(),
    nodeResolve({ preferBuiltins: true }),
    typescript({ tsconfig: './tsconfig.production.json' }),
  ],
};

export default configuration;
