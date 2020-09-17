import clone from 'ramda/src/clone';

import { ResourceId } from './Resource';
import {
  makeResultError,
  makeGetSetResultSuccess,
  UniformFiniteSource,
  makeGetListResultSuccees,
  ERROR_RESOURCE_NOT_EXISTS,
} from './Source';

export type MemorySourceOptions<T> = {
  initialResources?: Record<ResourceId, T>;
};

export function createMemorySource<T, E extends string>({
  initialResources = {},
}: MemorySourceOptions<T> = {}): UniformFiniteSource<T, E> {
  const resources = clone(initialResources);

  return {
    async get(id) {
      if (typeof resources[id] === 'undefined') {
        return makeResultError(ERROR_RESOURCE_NOT_EXISTS as E);
      }

      return makeGetSetResultSuccess(id, resources[id]);
    },
    async set(id, data) {
      resources[id] = data;

      return makeGetSetResultSuccess(id, data);
    },
    getList() {
      return Promise.resolve(makeGetListResultSuccees(Object.keys(resources).map(k => ({ id: k }))));
    },
  };
}
