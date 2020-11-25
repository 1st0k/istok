import { createElement, useState, useEffect } from 'react';
import { MDXProvider } from '@mdx-js/react';

import { Scope, HydrationContext, HydrationData } from './context';
import { render } from './render';
import { loadComponents } from './load-components';

type HydrationOptions = {
  element?: 'div' | 'span';
};

export function useHydrate<S extends Scope = {}>(
  { compiledSource, contentHtml, scope = {} as S }: HydrationData<S>,
  context: HydrationContext = {},
  { element = 'div' }: HydrationOptions
) {
  const [result, setResult] = useState<JSX.Element>(
    createElement(element, {
      dangerouslySetInnerHTML: {
        __html: contentHtml,
      },
    })
  );

  // if we're server-side, we can return the raw output early
  // if (typeof window === 'undefined') return result;

  useEffect(() => {
    const handle = window.requestIdleCallback(async () => {
      const rendered = await render({ compiledSource, scope, context, wrapInProvider: false });
      // wrapping the content with MDXProvider will allow us to customize the standard
      // markdown components (such as "h1" or "a") with the "components" object
      const wrappedWithMdxProvider = createElement(
        MDXProvider,
        {
          components: {
            ...(context.components ?? {}),
            ...(await loadComponents(context.asyncComponents)),
          },
        },
        rendered
      );

      setResult(wrappedWithMdxProvider);

      window.cancelIdleCallback(handle);
    });
  }, [compiledSource]);

  return result;
}
