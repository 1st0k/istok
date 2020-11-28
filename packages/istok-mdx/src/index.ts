export { loadComponents, makeComponentsLoader, AsyncComponentsLoadConfig, ComponentsMap } from './components';
export { CreateElementOptions, createElement } from './create-element';

/* Any object-like data can be passed down to MDX and can be refenced */
export type MDXScope = {
  [k: string]: unknown;
};
