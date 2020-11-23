import React from 'react';

import { mdx, MDXProvider } from '@mdx-js/react';

import { Scope, HydrationContext } from './context';

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

  async function awaitComponents() {
    const components = context.promisedComponents;
    if (!components) {
      return {};
    }

    const promisedComponentsNames = Object.keys(components);

    const awaitedComponents: Array<Promise<React.ComponentType>> = promisedComponentsNames.map(name => {
      return components[name]();
    });

    try {
      const result = await Promise.all(awaitedComponents);
      return result;
    } catch (e) {
      console.log(`failed to load components:\n`, e);
      return {};
    }
  }

  const components = {
    ...(context.components ?? {}),
    ...(await awaitComponents()),
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
