import { ResourceOpListResult, Source, UniformFiniteSource } from './Source';
import { createSourcesSequence } from './SourcesSequence';

export type CacheLevelOptions<DataType, E> = {
  source: Source<DataType, E>;
  invalidateOnInit?: boolean;
  invalidationInterval?: number;
};

export type CachableSourceOptions<DataType, E> = {
  source: Source<DataType, E>;
  caches: CacheLevelOptions<DataType, E>[];
};

export interface CachableSource<DataType> extends UniformFiniteSource<DataType, string> {
  release(): void;
}

export function createCachableSource<DataType>({
  caches,
  source,
}: CachableSourceOptions<DataType, string>): CachableSource<DataType> {
  if (caches.length === 0) {
    throw new Error(`Failed to create CachedSource: at least 1 level of cache is required.`);
  }
  const seq = createSourcesSequence([...caches.map(cache => ({ source: cache.source })), { source }]);

  const invalidationHandlers: ReturnType<typeof setInterval>[] = [];

  async function invalidateOnInit() {
    const clearPromises: Promise<ResourceOpListResult<string>>[] = [];
    for (let i = 0; i < seq.sources.length - 1; i++) {
      const s = seq.sources[i];
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

    for (let i = 0; i < seq.sources.length - 1; i++) {
      const period = caches[i].invalidationInterval;
      if (period === undefined) {
        continue;
      }
      invalidationHandlers.push(
        setInterval(() => {
          seq.sources[i].clear();
        }, period)
      );
    }
  }

  setupInvalidationOnPeriod();
  const isReady = invalidateOnInit();

  function executeWhenReady<T>(fn: () => Promise<T>) {
    return new Promise<T>(async resolve => {
      await isReady;
      resolve(fn());
    });
  }

  return {
    release() {
      clearInvalidationHandlers();
    },
    async get(id) {
      return executeWhenReady(() => seq.get(id));
    },
    async set(id, data) {
      return executeWhenReady(() => seq.set(id, data));
    },
    async getList() {
      return executeWhenReady(() => seq.getList());
    },
    async clear() {
      return executeWhenReady(() => seq.clear());
    },
  };
}
