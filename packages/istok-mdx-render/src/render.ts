import React, { ElementType } from 'react';

import { mdx, MDXProvider } from '@mdx-js/react';

import { Scope } from './context';

const makeElement = (body: string) => `React.createElement(${body})`;
const makeReturn = (body: string) => `return ${makeElement(body)};`;

type RenderOptions = {
  compiledSource: string;
  scope: Scope;
  components?: Record<string, ElementType>;
  wrapInProvider?: boolean;
};

export async function render(options: RenderOptions) {
  const { compiledSource, scope, wrapInProvider } = options;

  const components = options.components ?? {};

  const fullScope = wrapInProvider ? { mdx, MDXProvider, components, ...scope } : { mdx, ...components, ...scope };
  const keys = Object.keys(fullScope);
  const values = Object.values(fullScope);

  const functionReturn = wrapInProvider
    ? makeReturn(`MDXProvider, { components }, ${makeElement('MDXContent, {}')}`)
    : makeReturn(`MDXContent, {}`);

  const renderMDX = new Function('React', ...keys, `${compiledSource}${functionReturn}`);

  return renderMDX(React, ...values);
}
