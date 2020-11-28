import mdx from '@mdx-js/mdx';

import { transformAsync } from '@babel/core';

import presetEnv from '@babel/preset-env';
import presetReact from '@babel/preset-react';

import BabelPluginMdxBrowser from './babel-plugin-mdx-browser';
import createBabelPluginIstokResource from './babel-plugin-istok-resource';

type ResourceToUrl = (source: string) => string;

export type BaseCompileOptions = {
  remarkPlugins: any[];
  rehypePlugins: any[];
  compilers: any[];
};

export type CompileOptions = BaseCompileOptions & {
  resourceToURL: ResourceToUrl;
};

export const DEFAULT_COMPILE_OPTIONS: CompileOptions = {
  resourceToURL: x => x,
  rehypePlugins: [],
  remarkPlugins: [],
  compilers: [],
};

export type CompilationResult = [string, string];

export async function compile(mdxPlainSource: string, options?: CompileOptions): Promise<CompilationResult> {
  const { resourceToURL, ...restOptions } = options ?? DEFAULT_COMPILE_OPTIONS;

  const istokPlugins = [createBabelPluginIstokResource({ resourceToURL })];

  const compiledES6CodeFromMdx = await mdx(mdxPlainSource, { ...restOptions, skipExport: true });

  const [serverCode, browserCode] = await Promise.all([
    transformAsync(compiledES6CodeFromMdx, {
      presets: [presetReact, presetEnv],
      plugins: istokPlugins,
      configFile: false,
    }),
    transformAsync(compiledES6CodeFromMdx, {
      presets: [presetReact, presetEnv],
      plugins: [BabelPluginMdxBrowser, ...istokPlugins],
      configFile: false,
    }),
  ]);

  if (!serverCode || !serverCode.code || !browserCode || !browserCode.code) {
    throw new Error('No code was generated.');
  }

  return [serverCode.code, browserCode.code];
}
