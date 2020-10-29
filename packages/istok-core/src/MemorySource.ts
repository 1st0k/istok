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

export function createMemorySource<T>({ initialResources = {} }: MemorySourceOptions<T> = {}): UniformFiniteSource<
  T,
  string
> {
  const resources = new Map(Object.entries(initialResources));

  return {
    async get(id) {
      if (!resources.has(id)) {
        return makeResultError(ERROR_RESOURCE_NOT_EXISTS);
      }

      return makeGetSetResultSuccess(id, resources.get(id)!);
    },
    async set(id, data) {
      resources.set(id, data);

      return makeGetSetResultSuccess(id, data);
    },
    async getList(filter) {
      const list: { id: ResourceId }[] = [];
      for (const k of resources.keys()) {
        if (filter && !filter(k)) {
          continue;
        }
        list.push({ id: k });
      }

      return makeGetListResultSuccees(list);
    },
    async clear() {
      resources.clear();
      return this.getList();
    },
  };
}
