/*
  Uniform Finite Source of Resources:
    - uniform resources (all resource have the same shape)
    - finite resources count at any given moment
*/

import { ResourceId, Resource, makeResource } from './Resource';
import { Identifiable } from './utils/id';
import { ERROR, Error, SUCCESS, Success } from './utils/Result';

/*
  Result of operations over Resource that affect whole Resource:
    - set Resource's data
    - get Resource
*/
type ResourceOpResultSuccess<T> = { type: Success; resource: Resource<T> };
type ResourceOpResultError<E extends string> = { type: Error; error: E };
type ResourceOpResult<D, E extends string> = ResourceOpResultSuccess<D> | ResourceOpResultError<E>;

type ResourceOpListResultSuccess<Id extends ResourceId> = { type: Success; resources: Identifiable<Id>[] };

type ResourceOpListResult<E extends string, Id extends ResourceId> =
  | ResourceOpListResultSuccess<Id>
  | ResourceOpResultError<E>;

export interface UniformFiniteSource<DataType, E extends string = string, Id extends ResourceId = ResourceId> {
  get(resourceId: Id): Promise<ResourceOpResult<DataType, E>>;
  set(resourceId: Id, data: DataType): Promise<ResourceOpResult<DataType, E>>;

  getList(): Promise<ResourceOpListResult<E, Id>>;
}

export type Source<DataType, E extends string = string, Id extends ResourceId = ResourceId> = UniformFiniteSource<
  DataType,
  E,
  Id
>;

export function makeResultError<E extends string>(error: E): ResourceOpResultError<E> {
  return {
    type: ERROR,
    error,
  };
}

export function makeGetSetResultSuccess<T, Id extends ResourceId = ResourceId>(
  id: Id,
  data: T
): ResourceOpResultSuccess<T> {
  return {
    type: SUCCESS,
    resource: makeResource(id, data),
  };
}

export function makeGetListResultSuccees<Id extends ResourceId>(
  ids: Identifiable<Id>[]
): ResourceOpListResultSuccess<Id> {
  return {
    type: SUCCESS,
    resources: ids,
  };
}

// Results with errors has the same type for any operation
export function isResultError<E extends string>(
  result: ResourceOpResult<unknown, E> | ResourceOpListResult<E, any>
): result is ResourceOpResultError<E> {
  return result.type === ERROR;
}

// Successful Results for Get/Set and List operations are different
export function isGetSetResultSuccess<T>(result: ResourceOpResult<T, any>): result is ResourceOpResultSuccess<T> {
  return result.type === SUCCESS;
}

export function isGetListResultSuccess<Id extends ResourceId = ResourceId>(
  result: ResourceOpListResult<any, Id>
): result is ResourceOpListResultSuccess<Id> {
  return result.type === SUCCESS;
}
