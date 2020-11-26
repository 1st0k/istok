import { ElementType } from 'react';
import { renderToString as reactRenderToString } from 'react-dom/server';
import { render as renderCore, loadComponents } from '@istok/mdx-render';
import { AsyncComponentsLoadConfig } from '@istok/mdx-render/dist/load-components';

import { Scope, DEFAULT_COMPILE_OPTIONS, CompileOptions, compile } from './compile';

export interface RenderToStringOptions<S extends Scope> {
  components?: {
    [k: string]: ElementType;
  };
  asyncComponents?: AsyncComponentsLoadConfig;
  scope?: S;
  compileOptions?: CompileOptions;
}

// https://github.com/hashicorp/next-mdx-remote/blob/master/render-to-string.js
export async function render<S extends Scope>(
  source: string,
  {
    components,
    asyncComponents,
    compileOptions = DEFAULT_COMPILE_OPTIONS,
    scope = {} as S,
  }: RenderToStringOptions<S> = {
    compileOptions: DEFAULT_COMPILE_OPTIONS,
  }
) {
  const [compiledSource, laterCompiledSource] = await compile(source, compileOptions);
  const loadedAsyncComponents = await loadComponents(asyncComponents);
  const rendered = await renderCore({
    compiledSource,
    scope,
    components: {
      ...(components ?? {}),
      ...loadedAsyncComponents,
    },
    wrapInProvider: true,
  });

  return {
    compiledSource: laterCompiledSource,
    contentHtml: reactRenderToString(rendered),
    scope,
  };
}
