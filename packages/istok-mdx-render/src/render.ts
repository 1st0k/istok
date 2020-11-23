import React from 'react';

import { mdx, MDXProvider } from '@mdx-js/react';

import { Scope, HydrationContext } from './context';
import { loadComponents } from './load-components';

const makeElement = (body: string) => `React.createElement(${body})`;
const makeExecutor = (body: string) => `return ${makeElement(body)};`;

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
    ...(await loadComponents(context.promisedComponents)),
  };

  const fullScope = { mdx, components, MDXProvider, ...scope };
  const keys = Object.keys(fullScope);
  const values = Object.values(fullScope);

  const executor = wrapInProvider
    ? makeExecutor(`MDXProvider, { components }, ${makeElement('MDXContent, {}')}`)
    : makeExecutor(`MDXContent, {}`);

  const renderMDX = new Function('React', ...keys, `${compiledSource}${executor}`);

  return renderMDX(React, ...values);
}
