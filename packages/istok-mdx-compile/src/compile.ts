import mdx from '@mdx-js/mdx';
import { remove } from 'unist-util-remove';
import { Plugin, Pluggable, Compiler } from 'unified';

import { transformAsync } from '@babel/core';
import presetEnv from '@babel/preset-env';
import presetReact from '@babel/preset-react';
import { MDXScope, MDXSerialized } from '@istok/mdx';

import createBabelPluginIstokResource from './babel-plugin-istok-resource';

type ResourceToUrl = (source: string) => string;

export type CompileOptionsBase = {
  remarkPlugins?: Pluggable[];
  rehypePlugins?: Pluggable[];
  hastPlugins?: Pluggable[];
  compilers?: Compiler[];
};

export type CompileOptions = CompileOptionsBase & {
  resourceToURL: ResourceToUrl;
  scope?: MDXScope;
};

export const DEFAULT_COMPILE_OPTIONS: CompileOptions = {
  resourceToURL: x => x,
  rehypePlugins: [],
  remarkPlugins: [],
  hastPlugins: [],
  compilers: [],
  scope: {},
};

const removeImportsExportsPlugin: Plugin = () => tree => remove(tree, ['import', 'export']);

export async function compile(
  mdxPlainSource: string,
  options: CompileOptions = DEFAULT_COMPILE_OPTIONS
): Promise<MDXSerialized> {
  const { resourceToURL, scope = {}, ...mdxOptions } = options;
  options.remarkPlugins = [...(options.remarkPlugins || []), removeImportsExportsPlugin];

  const istokPlugins = [createBabelPluginIstokResource({ resourceToURL })];

  const compiledES6CodeFromMdx = await mdx(mdxPlainSource, { ...mdxOptions, skipExport: true });

  const transformed = await transformAsync(compiledES6CodeFromMdx, {
    presets: [presetReact, presetEnv],
    plugins: istokPlugins,
    configFile: false,
  });

  if (!transformed || !transformed.code) {
    throw new Error('No code was generated.');
  }

  return { compiledSource: transformed.code, scope };
}
