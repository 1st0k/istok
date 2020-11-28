import { createElement as createElementReact, useState, useEffect } from 'react';
import { MDXProvider } from '@mdx-js/react';

import { createElement, ComponentsMap, MDXScope, AsyncComponentsLoadConfig, loadComponents } from '@istok/mdx';

type HydrationOptions = {
  element?: 'div' | 'span';
};

export interface HydrationParams<S extends MDXScope> {
  contentHtml: string;
  scope?: S;
  asyncComponents?: AsyncComponentsLoadConfig;
  components?: ComponentsMap;
}

export function useMdx<S extends MDXScope = {}>(
  compiledSource: string,
  params: HydrationParams<S>,
  { element = 'div' }: HydrationOptions
) {
  const { contentHtml, scope = {} as S } = params;
  const [result, setResult] = useState<JSX.Element>(
    createElementReact(element, {
      dangerouslySetInnerHTML: {
        __html: contentHtml,
      },
    })
  );

  // if we're server-side, we can return the raw output early
  // if (typeof window === 'undefined') return result;

  useEffect(() => {
    const handle = window.requestIdleCallback(async () => {
      const components = {
        ...(params.components ?? {}),
        ...(await loadComponents(params.asyncComponents)),
      };

      const element = await createElement(compiledSource, { scope, components, wrapInProvider: false });
      // wrapping the content with MDXProvider will allow us to customize the standard
      // markdown components (such as "h1" or "a") with the "components" object
      const wrappedWithMdxProvider = createElementReact(
        MDXProvider,
        {
          components,
        },
        element
      );

      setResult(wrappedWithMdxProvider);

      window.cancelIdleCallback(handle);
    });
  }, [compiledSource]);

  return result;
}
