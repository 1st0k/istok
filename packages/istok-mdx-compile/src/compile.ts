import mdx from '@mdx-js/mdx';

import { transformAsync } from '@babel/core';

import presetEnv from '@babel/preset-env';
import presetReact from '@babel/preset-react';

import BabelPluginMdxBrowser from './babel-plugin-mdx-browser';
import createBabelPluginIstokResource from './babel-plugin-istok-resource';

export type Hydratable<T> = T;

export type Scope = {
  [k: string]: unknown;
};

export type TransformResult<S extends Scope> = {
  compiledSource: string;
  contentHtml: string;
  scope: S;
};

type ResourceToUrl = (source: string) => string;

const identity = <T>(x: T) => x;

export type CompileOptions = {
  resourceToURL: ResourceToUrl;
  remarkPlugins: any[];
  rehypePlugins: any[];
  compilers: any[];
};

export const DEFAULT_COMPILE_OPTIONS: CompileOptions = {
  resourceToURL: identity,
  rehypePlugins: [],
  remarkPlugins: [],
  compilers: [],
};

export async function compile(source: string, options?: CompileOptions) {
  const { resourceToURL, ...restOptions } = options ?? DEFAULT_COMPILE_OPTIONS;

  const istokPlugins = [createBabelPluginIstokResource({ resourceToURL })];

  const code = await mdx(source, { ...restOptions, skipExport: true });

  // mdx gives us back es6 code, we then need to transform into two formats:
  // - first a version we can render to string right now as a "serialized" result
  // - next a version that is fully browser-compatible that we can eval to rehydrate
  const [now, later] = await Promise.all([
    // this one is for immediate evaluation so we can renderToString below
    transformAsync(code, {
      presets: [presetReact, presetEnv],
      plugins: istokPlugins,
      configFile: false,
    }),
    // this one is for the browser to eval and rehydrate, later
    transformAsync(code, {
      presets: [presetReact, presetEnv],
      plugins: [BabelPluginMdxBrowser, ...istokPlugins],
      configFile: false,
    }),
  ]);

  // evaluate the code
  // NOTES:
  // - relative imports can't be expected to work with remote files, we'd need
  //   an extra babel transform to be able to import specific file paths
  if (!now || !now.code || !later || !later.code) {
    throw new Error('No code was generated');
  }

  return [now.code, later.code];
}
