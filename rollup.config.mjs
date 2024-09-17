/* eslint-disable unicorn/prevent-abbreviations */
/* cspell:ignore builtins */

import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

import packageJson from './package.json' assert { type: 'json' };

/**
 * @type {import('rollup').RollupOptions}
 */
const esmConfiguration = {
  cache: false,
  external: Object.keys(packageJson.dependencies ?? {}),
  input: './src/index.ts',
  output: {
    dir: './lib/esm',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'src',
    sourcemap: true,
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    typescript({ tsconfig: 'tsconfig.esm.json' }),
  ],
  strictDeprecations: true,
};

/**
 * @type {import('rollup').RollupOptions}
 */
const cjsConfiguration = {
  cache: false,
  external: Object.keys(packageJson.dependencies ?? {}),
  input: './src/index.ts',
  output: {
    dir: './lib/cjs',
    format: 'cjs',
    preserveModules: true,
    preserveModulesRoot: 'src',
    sourcemap: true,
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    typescript({ tsconfig: 'tsconfig.cjs.json' }),
  ],
  strictDeprecations: true,
};

export default [esmConfiguration, cjsConfiguration];
