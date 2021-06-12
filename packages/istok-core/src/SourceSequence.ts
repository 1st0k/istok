import { Entity, EntityRespone, Id } from './Entity';
import { ResultError, error } from './Result';
import { Source, QueryParams, QueryResult, GenericResult } from './Source';

type Interval = [number, number];

type SourceDescription = {
  source: {
    index: number;
  };
};

type EntityWithSourceDetailsResponse<T> = EntityRespone<T> & SourceDescription;

export interface SourceSequence<T> {
  getSources(interval?: Interval): Source<T>[];

  set(id: Id, data: T, interval?: Interval): Promise<GenericResult[]>;

  getFirst(id: Id, inverse?: boolean, interval?: Interval): Promise<EntityWithSourceDetailsResponse<T> | ResultError>;
  getEvery(id: Id, interval?: Interval): Promise<Array<EntityRespone<T> | ResultError>>;

  queryFirst(
    params: QueryParams,
    inverse?: boolean,
    interval?: Interval
  ): Promise<(QueryResult<Entity<T>> & SourceDescription) | ResultError>;
  queryEvery(params: QueryParams, interval?: Interval): Promise<Array<QueryResult<Entity<T>> | ResultError>>;

  idsFirst(
    params: QueryParams,
    inverse?: boolean,
    interval?: Interval
  ): Promise<(QueryResult<Id> & SourceDescription) | ResultError>;
  idsEvery(params: QueryParams, interval?: Interval): Promise<Array<QueryResult<Id> | ResultError>>;

  delete(id: Id, interval?: Interval): Promise<GenericResult[]>;
  clear(interval?: Interval): Promise<GenericResult[]>;
}

export type CreateSourceSequenceOptions<T> = {
  sources: Array<Source<T>>;
};

function getIndicesOnInterval(interval: Interval, inverse: boolean) {
  let indices = [];

  if (inverse) {
    let c = 0;
    for (let i = interval[1]; i >= interval[0]; i--) {
      indices[c++] = i;
    }
  } else {
    let c = 0;
    for (let i = interval[0]; i <= interval[1]; i++) {
      indices[c++] = i;
    }
  }

  return indices;
}

export function createSourceSequence<T>({ sources }: CreateSourceSequenceOptions<T>): SourceSequence<T> {
  const sourcesCount = sources.length;
  const finalSourceIndex = sourcesCount - 1;

  if (sourcesCount === 0) {
    throw new Error('SourcesSequence must contain atleast one Source');
  }

  const fullInterval: Interval = [0, finalSourceIndex];

  function assertInterval([from, to]: Interval) {
    if (to >= sourcesCount || from < 0) {
      throw new Error(`Incorrect interval boundaries: expected [0, ${finalSourceIndex}], got [${from}, ${to}]`);
    }
  }

  function getSourcesOnInterval(interval: Interval = fullInterval, inverse = false) {
    return getIndicesOnInterval(interval, inverse).map(i => sources[i]);
  }

  async function setResource(id: Id, data: T, interval: Interval) {
    assertInterval(interval);

    return Promise.all(getSourcesOnInterval(interval).map(source => source.set(id, data)));
  }

  return {
    getSources(interval: Interval = fullInterval): Source<T>[] {
      return getSourcesOnInterval(interval);
    },
    async set(id, data, interval = fullInterval) {
      return setResource(id, data, interval);
    },

    async getFirst(id, inverse = false, interval = fullInterval) {
      const sources = getSourcesOnInterval(interval, inverse);

      let sourceIndex = interval[inverse ? 1 : 0];
      for (const source of sources) {
        let result = await source.get(id);

        if (result.kind === 'Success') {
          return { ...result, source: { index: sourceIndex } };
        }

        sourceIndex += inverse ? -1 : 1;
      }

      return error(`400::No resource with id "${id}" on any source within interval [${interval[0]}, ${interval[1]}]`);
    },
    async getEvery(id, interval = fullInterval) {
      return Promise.all(getSourcesOnInterval(interval).map(source => source.get(id)));
    },

    async queryFirst(params, inverse = false, interval = fullInterval) {
      const sources = getSourcesOnInterval(interval, inverse);

      let sourceIndex = interval[inverse ? 1 : 0];
      for (const source of sources) {
        let result = await source.query(params);

        if (result.kind === 'Success' && result.data.length > 0) {
          return { ...result, source: { index: sourceIndex } };
        }

        sourceIndex += inverse ? -1 : 1;
      }
      return error(
        `400::Unable to query "${JSON.stringify(params)}" on any source within interval [${interval[0]}, ${
          interval[1]
        }]`
      );
    },
    async queryEvery(query, interval = fullInterval) {
      return Promise.all(getSourcesOnInterval(interval).map(source => source.query(query)));
    },

    async idsFirst(query, inverse = false, interval = fullInterval) {
      const sources = getSourcesOnInterval(interval, inverse);

      let sourceIndex = interval[inverse ? 1 : 0];
      for (const source of sources) {
        let result = await source.ids(query);

        if (result.kind === 'Success') {
          return { ...result, source: { index: sourceIndex } };
        }

        sourceIndex += inverse ? -1 : 1;
      }

      return error(
        `400::Unable to query "${JSON.stringify(query)}" on any source within interval [${interval[0]}, ${interval[1]}]`
      );
    },

    async idsEvery(query, interval = fullInterval) {
      return Promise.all(getSourcesOnInterval(interval).map(source => source.ids(query)));
    },

    async delete(id, interval = fullInterval) {
      return Promise.all(getSourcesOnInterval(interval).map(source => source.delete(id)));
    },

    async clear(interval = fullInterval) {
      return Promise.all(getSourcesOnInterval(interval).map(source => source.clear()));
    },
  };
}
