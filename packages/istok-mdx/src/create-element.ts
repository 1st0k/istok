import React from 'react';
import { mdx, MDXProvider } from '@mdx-js/react';

import { MDXScope } from './';
import { ComponentsMap } from './components';

const makeElement = (body: string) => `React.createElement(${body})`;
const makeReturn = (body: string) => `return ${makeElement(body)};`;

export type CreateElementOptions = {
  scope: MDXScope;
  components?: ComponentsMap;
  wrapInProvider?: boolean;
};

export function createElement(compiledSource: string, options: CreateElementOptions) {
  const { scope, wrapInProvider } = options;

  const components = options.components ?? {};

  const fullScope = wrapInProvider ? { mdx, MDXProvider, components, ...scope } : { mdx, ...components, ...scope };
  const keys = Object.keys(fullScope);
  const values = Object.values(fullScope);

  const functionReturn = wrapInProvider
    ? makeReturn(`MDXProvider, { components }, ${makeElement('MDXContent, {}')}`)
    : makeReturn(`MDXContent, {}`);

  const createMdxElement = new Function('React', ...keys, `${compiledSource}${functionReturn}`);

  return createMdxElement(React, ...values);
}
