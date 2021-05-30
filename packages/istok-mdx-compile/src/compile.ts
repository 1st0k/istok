import mdx from '@mdx-js/mdx';
import * as uur from 'unist-util-remove';
import { Plugin, Pluggable, Compiler } from 'unified';

import { MDXScope, MDXSerialized } from '@istok/mdx';

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

const removeImportsExportsPlugin: Plugin = () => tree => uur.remove(tree, ['import', 'export']);

const isBrowser = process.env.JEST_WORKER_ID === undefined && typeof window !== 'undefined';

export async function compile(
  mdxPlainSource: string,
  options: CompileOptions = DEFAULT_COMPILE_OPTIONS
): Promise<MDXSerialized> {
  const { resourceToURL, scope = {}, ...mdxOptions } = options;
  options.remarkPlugins = [...(options.remarkPlugins || []), removeImportsExportsPlugin];

  const compiledES6CodeFromMdx = await mdx(mdxPlainSource, { ...mdxOptions, skipExport: true });

  if (!isBrowser) {
    const esbuild = await import('esbuild');
    const { code } = await esbuild.transform(compiledES6CodeFromMdx, {
      loader: 'jsx',
      jsxFactory: 'mdx',
      minify: true,
      target: ['es2020', 'node12'],
    });

    return { compiledSource: code, scope };
  } else {
    const esbuild = await import('esbuild-wasm');
    await esbuild.initialize({
      wasmURL: './node_modules/esbuild-wasm/esbuild.wasm',
    });

    const { code } = await esbuild.transform(compiledES6CodeFromMdx, {
      loader: 'jsx',
      jsxFactory: 'mdx',
      minify: true,
      target: ['es2020', 'node12'],
    });

    return { compiledSource: code, scope };
  }
}
