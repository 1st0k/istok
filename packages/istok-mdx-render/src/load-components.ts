import { ElementType } from 'react';

import { loadMap, makeLoadMap, AsyncLoadMap, LoadMapLoader } from '@istok/lazy-load';

export type AsyncComponentsLoadConfig = AsyncLoadMap<ElementType>;

export const loadComponents = (map: AsyncComponentsLoadConfig | undefined) => loadMap(map);

export const makeComponentsLoader = (components: string[], loader: LoadMapLoader<ElementType>) =>
  makeLoadMap(components, loader);
