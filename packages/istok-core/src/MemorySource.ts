import { Entity, entityResponse, Id } from './Entity';
import { error, success } from './Result';
import { QueryParams, Source } from './Source';

export type MemorySourceOptions<T> = {
  name?: string;
  initialResources?: Record<Id, T>;
};

type QueryMapOptions<T, I, D> = {
  iterator: (map: Map<string, T>) => IterableIterator<I>;
  id(v: I): Id;
  data(v: I): D;
};

function queryMap<T, I, D>(
  map: Map<Id, T>,
  options: QueryMapOptions<T, I, D>,
  { limit = 0, offset = 0, filter }: QueryParams = {}
) {
  const totalCount = map.size;
  let selected = 0;

  const entries = options.iterator(map);

  for (let i = 0; i < offset; i++) {
    entries.next();
  }

  let result: Array<D> = [];

  for (let i = 0; i < limit || totalCount; i++) {
    const current = entries.next().value as I | undefined;
    if (!current) {
      break;
    }

    const id = options.id(current);
    const data = options.data(current);

    if (!filter || (filter && filter(id))) {
      selected++;
      result.push(data);
    }
  }

  return {
    result,
    selected,
    totalCount,
  };
}

export function createMemorySource<T>(options: MemorySourceOptions<T> = {}): Source<T> & { name?: string } {
  const { name, initialResources = {} } = options;
  const resources = new Map(Object.entries(initialResources));

  return {
    name,
    async get(id) {
      if (!resources.has(id)) {
        return error(`400::Resource with id ${id} do not exist`);
      }

      return entityResponse(id, resources.get(id)!);
    },
    async set(id, data) {
      resources.set(id, data);

      return success('OK');
    },
    async query(params) {
      const { result, totalCount } = queryMap<T, [Id, T], Entity<T>>(
        resources,
        {
          id(v) {
            return v[0];
          },
          data(v) {
            return { id: v[0], entity: v[1] };
          },
          iterator(map) {
            return map.entries();
          },
        },
        params
      );

      return {
        kind: 'Success',
        data: result,
        total: totalCount,
        next: null,
        prev: null,
      };
    },

    async ids(params: QueryParams) {
      const { result, totalCount } = queryMap<T, Id, Id>(
        resources,
        {
          id(v) {
            return v;
          },
          data(v) {
            return v;
          },
          iterator(map) {
            return map.keys();
          },
        },
        params
      );

      return {
        kind: 'Success',
        data: result,
        total: totalCount,
        next: null,
        prev: null,
      };
    },
    async delete(id) {
      if (resources.delete(id)) {
        return success('OK');
      }
      return error(`400::Unable to delete entity with id "${id}"`);
    },
    async clear() {
      resources.clear();
      return success('OK');
    },
  };
}
