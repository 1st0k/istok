import { IdString } from './utils/id';

export type ResourceId = IdString;

export interface Resource<T> {
  id: ResourceId;
  data: T;
}

export function makeResource<T>(id: ResourceId, data: T): Resource<T> {
  return {
    id,
    data,
  };
}
