import { AsyncComponentsLoadConfig } from './load-components';

export type Scope = {
  [k: string]: unknown;
};

export interface HydrationData<S extends Scope> {
  compiledSource: string;
  contentHtml: string;
  scope?: S;
}

export type HydrationContext = {
  components?: Record<string, React.ComponentType>;
  promisedComponents?: AsyncComponentsLoadConfig;
};
