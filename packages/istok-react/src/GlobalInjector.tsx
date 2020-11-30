import React from 'react';
import { GLOBAL_INJECTED_DATA_KEY } from './common';

export type GlobalInjectorProps<T> = {
  data: T;
  dataKey?: string;
};

export function GlobalInjector<T>({ data, dataKey = GLOBAL_INJECTED_DATA_KEY }: GlobalInjectorProps<T>) {
  return <script dangerouslySetInnerHTML={{ __html: `window['${dataKey}']=${JSON.stringify(data)}` }}></script>;
}
