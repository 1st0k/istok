import { createElement, useState, useEffect } from 'react';
import { MDXProvider } from '@mdx-js/react';

import { Scope, HydrationContext, HydrationData } from './context';
import { render } from './render';

type HydrationOptions = {
  element?: 'div' | 'span';
};

export function useHydrate<S extends Scope = {}>(
  { compiledSource, contentHtml, scope = {} as S }: HydrationData<S>,
  { components }: HydrationContext = {},
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
    const handle = window.requestIdleCallback(() => {
      // wrapping the content with MDXProvider will allow us to customize the standard
      // markdown components (such as "h1" or "a") with the "components" object
      const wrappedWithMdxProvider = createElement(
        MDXProvider,
        { components },
        render({ compiledSource, scope, context: { components }, wrapInProvider: false })
      );

      setResult(wrappedWithMdxProvider);

      window.cancelIdleCallback(handle);
    });
  }, [compiledSource]);

  return result;
}