import { renderToString as reactRenderToString } from 'react-dom/server';
import { createElement, loadComponents, AsyncComponentsLoadConfig, MDXScope, ComponentsMap } from '@istok/mdx';

import { DEFAULT_COMPILE_OPTIONS, CompileOptions, compile } from './compile';

export interface RenderOptions<S extends MDXScope> {
  components?: ComponentsMap;
  asyncComponents?: AsyncComponentsLoadConfig;
  scope?: S;
  compileOptions?: CompileOptions;
}

export async function render<S extends MDXScope>(
  mdxPlainSource: string,
  options: RenderOptions<S> = {
    compileOptions: DEFAULT_COMPILE_OPTIONS,
  }
) {
  const { asyncComponents, compileOptions = DEFAULT_COMPILE_OPTIONS, scope = {} as S } = options;

  const [serverCode, browserCode] = await compile(mdxPlainSource, compileOptions);

  const loadedAsyncComponents = await loadComponents(asyncComponents);
  const components = {
    ...(options.components ?? {}),
    ...loadedAsyncComponents,
  };

  return {
    compiledSource: browserCode,
    contentHtml: reactRenderToString(
      createElement(serverCode, {
        scope,
        components,
        wrapInProvider: true,
      })
    ),
    scope,
  };
}
