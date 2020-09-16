export type ResourceId = readonly string[];

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
