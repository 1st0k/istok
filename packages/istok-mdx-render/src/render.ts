import React from 'react';

import { mdx, MDXProvider } from '@mdx-js/react';

import { Scope, HydrationContext } from './context';
import { loadComponents } from './load-components';

const makeElement = (body: string) => `React.createElement(${body})`;
const makeReturn = (body: string) => `return ${makeElement(body)};`;

type RenderOptions = {
  compiledSource: string;
  scope: Scope;
  context?: HydrationContext;
  wrapInProvider?: boolean;
};

export async function render(options: RenderOptions) {
  const { compiledSource, scope, wrapInProvider } = options;
  const { context = {} } = options;

  const components = {
    ...(context.components ?? {}),
    ...(await loadComponents(context.asyncComponents)),
  };

  const fullScope = wrapInProvider ? { mdx, MDXProvider, components, ...scope } : { mdx, ...components, ...scope };
  const keys = Object.keys(fullScope);
  const values = Object.values(fullScope);

  const functionReturn = wrapInProvider
    ? makeReturn(`MDXProvider, { components }, ${makeElement('MDXContent, {}')}`)
    : makeReturn(`MDXContent, {}`);

  const renderMDX = new Function('React', ...keys, `${compiledSource}${functionReturn}`);

  return renderMDX(React, ...values);
}
