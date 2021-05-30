import { MDXSerialized } from '@istok/mdx';

import { CompileOptions, compileToMdx, DEFAULT_COMPILE_OPTIONS } from './base';

export async function compile(
  mdxPlainSource: string,
  options: CompileOptions = DEFAULT_COMPILE_OPTIONS
): Promise<MDXSerialized> {
  const { code, scope } = await compileToMdx(mdxPlainSource, options);
  const esbuild = await import('esbuild');
  const { code: compiledSource } = await esbuild.transform(code, {
    loader: 'jsx',
    jsxFactory: 'mdx',
    minify: true,
    target: ['es2020', 'node12'],
  });

  return { compiledSource, scope };
}
