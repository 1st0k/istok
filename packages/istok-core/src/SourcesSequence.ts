/*
  Ordered Sequence of Sources

  Get/Set Strategies:
    1. Multilevel cache-like:
      - get: iterate over sources until first successful result, set previous sources with this result, skip next sources
          errors: 
            final result is error if all sources returned error
            optional: return error if triggered set for previous sources returned error
      - set: set all
          error: 
            variant a) final result is error if last source returned error
            variant b) final result is error if any source returned error
      - list:
          return list of resources from source with specified index 

*/

import { ResourceId } from './Resource';
import { isGetSetResultSuccess, makeResultError, ResourceOpListResult, ResourceOpResult, Source } from './Source';

// TODO: per Source behaviour can be useful for custom strategies
/* 
export type SourceBehaviour = {
  onGet(): void;
  onSet(): void;
  onNextGet(): void;
}; 
*/

type SourcesSequence<DataType, E extends string> = Pick<Source<DataType>, 'get' | 'set'> & {
  sources: Source<DataType, E>[];
  getList(sourceIndex?: number): Promise<ResourceOpListResult<E>>;
};

type SourceSequenceItem<DataType, E extends string> = {
  source: Source<DataType, E>;
};

export const ERROR_NO_SOURCES = 'NO_SOURCES' as const;

export function createSourcesSequence<DataType, E extends string>(
  items: SourceSequenceItem<DataType, E>[]
): SourcesSequence<DataType, E> {
  const sources = items.map(sd => sd.source);
  const sourcesCount = items.length;
  const finalSourceIndex = sourcesCount - 1;

  if (items.length === 0) {
    throw new Error('SourcesSequence must contain atleast one Source');
  }

  async function setResource(resourceId: ResourceId, data: DataType, from = 0, to = finalSourceIndex) {
    if (to >= sourcesCount || from < 0) {
      throw new Error(`Incorrect setResource boundaries: expected [0, ${finalSourceIndex}], got [${from}, ${to}]`);
    }

    const promises: Promise<ResourceOpResult<DataType, any>>[] = [];

    for (let i = from; i < to; i++) {
      promises.push(sources[i].set(resourceId, data));
    }

    return Promise.all(promises);
  }

  return {
    sources,
    async set(resourceId, data) {
      const results = await setResource(resourceId, data);
      // return result of final source
      return results[finalSourceIndex];
    },
    async get(resourceId) {
      let lastResult: ResourceOpResult<DataType, any> = makeResultError(ERROR_NO_SOURCES);
      for (let i = 0; i < sourcesCount; i++) {
        lastResult = await items[i].source.get(resourceId);

        if (isGetSetResultSuccess(lastResult)) {
          // set resource for previous sources
          await setResource(resourceId, lastResult.resource.data, 0, i);
          return lastResult;
        }
      }
      return lastResult;
    },
    async getList(sourceIndex: number = finalSourceIndex) {
      if (sourceIndex < 0 || sourceIndex > finalSourceIndex) {
        throw new Error(`Incorrect sourceIndex "${sourceIndex}", expected value from 0 to ${finalSourceIndex}`);
      }
      return sources[sourceIndex].getList();
    },
  };
}
