import { ReactElement } from 'react';
import { renderToString as reactRenderToString } from 'react-dom/server';
import { createElement, loadComponents, AsyncComponentsLoadConfig, MDXScope, ComponentsMap } from '@istok/mdx';

import { compile } from './compile';
import { DEFAULT_COMPILE_OPTIONS, CompileOptions } from './base';

export interface RenderOptions<S extends MDXScope> {
  components?: ComponentsMap;
  asyncComponents?: AsyncComponentsLoadConfig;
  scope?: S;
  compileOptions?: CompileOptions;
  enhanceRoot?(root: ReactElement): ReactElement;
  renderer?<T = string>(root: ReactElement): T;
  postRender?(): void;
}

export type RenderResult<S extends MDXScope> = {
  scope?: S;
  compiledSource: string;
  contentHtml: string;
};

export async function render<S extends MDXScope>(
  mdxPlainSource: string,
  options: RenderOptions<S> = {
    compileOptions: DEFAULT_COMPILE_OPTIONS,
  }
): Promise<RenderResult<S>> {
  const { asyncComponents, compileOptions = DEFAULT_COMPILE_OPTIONS, scope = {} as S } = options;
  const { enhanceRoot = root => root, renderer = reactRenderToString } = options;
  const { postRender = () => void 0 } = options;

  const { compiledSource } = await compile(mdxPlainSource, compileOptions);

  const loadedAsyncComponents = asyncComponents ? await loadComponents(asyncComponents) : {};
  const components = {
    ...(options.components ?? {}),
    ...loadedAsyncComponents,
  };

  const element = createElement(compiledSource, {
    scope,
    components,
    wrapInProvider: true,
  });

  const contentHtml = renderer(enhanceRoot(element));

  postRender();

  return {
    compiledSource,
    contentHtml,
    scope,
  };
}
