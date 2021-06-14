import mdx from '@mdx-js/mdx';
import * as uur from 'unist-util-remove';
import { Plugin, Compiler } from 'unified';
import { MDXScope } from '@istok/mdx';

export type ResourceToUrl = (source: string) => string;

export type CompileOptionsBase = {
  remarkPlugins?: Plugin[];
  rehypePlugins?: Plugin[];
  hastPlugins?: Plugin[];
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

export const removeImportsExportsPlugin: Plugin = () => tree => uur.remove(tree, ['import', 'export']);

export async function compileToMdx(
  mdxPlainSource: string,
  options: CompileOptions = DEFAULT_COMPILE_OPTIONS
): Promise<{ code: string; scope: CompileOptions['scope'] }> {
  const { resourceToURL, scope = {}, ...mdxOptions } = options;
  options.remarkPlugins = [...(options.remarkPlugins || []), removeImportsExportsPlugin];

  const compiledES6CodeFromMdx = await mdx(mdxPlainSource, { ...mdxOptions, skipExport: true });

  return { code: compiledES6CodeFromMdx, scope };
}
