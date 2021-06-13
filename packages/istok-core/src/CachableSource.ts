import { error } from './Result';
import { GenericResult, Source } from './Source';
import { createSourceSequence } from './SourceSequence';

export type CacheLevelOptions<T> = {
  source: Source<T>;
  invalidateOnInit?: boolean;
  invalidationInterval?: number;
};

export type CachableSourceOptions<T> = {
  source: Source<T>;
  caches: CacheLevelOptions<T>[];
};

export interface CachableSource<T> extends Source<T> {
  release(): void;
}

export function createCachableSource<T>({ caches, source }: CachableSourceOptions<T>): CachableSource<T> {
  const cacheSourcesCount = caches.length;
  if (cacheSourcesCount === 0) {
    throw new Error(`Failed to create CachedSource: at least one cache source is required.`);
  }

  const seq = createSourceSequence({ sources: [...caches.map(({ source }) => source), source] });
  const cacheSources = seq.getSources([0, cacheSourcesCount - 1]);
  const invalidationHandlers: ReturnType<typeof setInterval>[] = [];

  async function invalidateOnInit() {
    const clearPromises: Promise<GenericResult>[] = [];

    for (let i = 0; i < cacheSources.length; i++) {
      const s = cacheSources[i];
      const shouldInvalidate = caches[i].invalidateOnInit;
      if (shouldInvalidate) {
        clearPromises.push(s.clear());
      }
    }

    return await Promise.all(clearPromises);
  }

  function clearInvalidationHandlers() {
    for (const handler of invalidationHandlers) {
      clearInterval(handler);
    }

    invalidationHandlers.splice(0, invalidationHandlers.length);
  }

  async function setupInvalidationOnPeriod() {
    clearInvalidationHandlers();

    for (let i = 0; i < cacheSources.length; i++) {
      const period = caches[i].invalidationInterval;
      if (period === undefined) {
        continue;
      }
      invalidationHandlers.push(
        setInterval(() => {
          cacheSources[i].clear();
        }, period)
      );
    }
  }

  setupInvalidationOnPeriod();
  const isReady = invalidateOnInit();

  return {
    release() {
      clearInvalidationHandlers();
    },
    async get(id) {
      return isReady.then(async () => {
        const result = await seq.getFirst(id);
        if (result.kind === 'Success') {
          const originIndex = result.source.index;

          if (originIndex > 0) {
            await seq.set(id, result.data.entity, [0, originIndex - 1]);
          }
        }

        return result;
      });
    },
    async set(id, data) {
      return isReady.then(async () => {
        const result = await seq.set(id, data);

        return result[result.length - 1] || error(`Failed to set entity "${id}"`);
      });
    },
    async query(params) {
      return isReady.then(() => seq.queryFirst(params, true));
    },
    async ids(params) {
      return isReady.then(() => seq.idsFirst(params, true));
    },
    async delete(id) {
      return isReady.then(async () => {
        const result = await seq.delete(id);

        return result[result.length - 1] || error(`Failed to delete entity "${id}"`);
      });
    },
    async clear() {
      return isReady.then(async () => {
        const result = await seq.clear();

        return result[result.length - 1] || error(`Failed to clear sources`);
      });
    },
  };
}
