import { ElementType } from 'react';
import { AsyncComponentsLoadConfig } from './load-components';

export type Scope = {
  [k: string]: unknown;
};

export interface HydrationParams<S extends Scope> {
  compiledSource: string;
  contentHtml: string;
  scope?: S;
  asyncComponents?: AsyncComponentsLoadConfig;
  components?: Record<string, ElementType>;
}
