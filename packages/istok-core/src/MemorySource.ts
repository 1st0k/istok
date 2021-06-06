import { ResourceId } from './Resource';
import {
  makeResultError,
  makeGetSetResultSuccess,
  UniformFiniteSource,
  makeGetListResultSuccees,
  ERROR_RESOURCE_NOT_EXISTS,
  makeOpResultSuccess,
} from './Source';
import { identityTransforms, SourceOptions } from './SourceUtils';

export type MemorySourceOptions<T> = Pick<SourceOptions<T>, 'readTransform' | 'writeTransform'> & {
  initialResources?: Record<ResourceId, T>;
};

export function createMemorySource<T>(options: MemorySourceOptions<T> = {}): UniformFiniteSource<T, string> {
  const {
    initialResources = {},
    writeTransform = identityTransforms.write,
    readTransform = identityTransforms.read,
  } = options;
  const resources = new Map(Object.entries(initialResources));

  return {
    async get(id) {
      if (!resources.has(id)) {
        return makeResultError(ERROR_RESOURCE_NOT_EXISTS);
      }

      return makeGetSetResultSuccess(id, readTransform(resources.get(id)!));
    },
    async set(id, data) {
      resources.set(id, writeTransform(data) as T);

      return makeGetSetResultSuccess(id, data);
    },
    async getList(filter) {
      // todo: get by query = start from offset while not reach the limit
      const list: { id: ResourceId }[] = [];
      for (const k of resources.keys()) {
        if (filter && !filter(k)) {
          continue;
        }
        list.push({ id: k });
      }

      return makeGetListResultSuccees(list);
    },
    async remove(id) {
      if (resources.delete(id)) {
        return makeOpResultSuccess();
      }
      return makeResultError(`Failed to remove resource with id "${id}".`);
    },
    async clear() {
      resources.clear();
      return this.getList();
    },
  };
}
