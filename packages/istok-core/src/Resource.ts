import { IdStringArray } from './utils/id';

export type ResourceId = IdStringArray;

export interface Resource<T, I extends ResourceId = ResourceId> {
  id: I;
  data: T;
}

export function makeResource<T, I extends ResourceId = ResourceId>(id: I, data: T): Resource<T, I> {
  return {
    id,
    data,
  };
}
