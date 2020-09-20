/*
  Uniform Finite Source of Resources:
    - uniform resources (all resource have the same shape)
    - finite resources count at any given moment
*/

import { ResourceId, Resource, makeResource } from './Resource';
import { Identifiable } from '@istok/utils';
import { ERROR, Error, SUCCESS, Success } from '@istok/utils';

/*
  Result of operations over Resource that affect whole Resource:
    - set Resource's data
    - get Resource
*/
export type ResourceOpResultSuccess<T> = { type: Success; resource: Resource<T> };
export type ResourceOpResultError<E extends string> = { type: Error; error: E };
export type ResourceOpResult<D, E extends string> = ResourceOpResultSuccess<D> | ResourceOpResultError<E>;

export type ResourceOpListResultSuccess = { type: Success; resources: Identifiable<ResourceId>[] };

export type ResourceOpListResult<E extends string> = ResourceOpListResultSuccess | ResourceOpResultError<E>;

export const ERROR_RESOURCE_NOT_EXISTS = 'RESOURCE_NOT_EXISTS' as const;
export type ErrorResourceNotExists = typeof ERROR_RESOURCE_NOT_EXISTS;

export interface UniformFiniteSource<DataType, E extends string = string> {
  get(resourceId: ResourceId): Promise<ResourceOpResult<DataType, E>>;
  set(resourceId: ResourceId, data: DataType): Promise<ResourceOpResult<DataType, E>>;

  getList(): Promise<ResourceOpListResult<E>>;
}

export type Source<DataType, E extends string = string> = UniformFiniteSource<DataType, E>;

export function makeResultError<E extends string>(error: E): ResourceOpResultError<E> {
  return {
    type: ERROR,
    error,
  };
}

export function makeGetSetResultSuccess<T>(id: ResourceId, data: T): ResourceOpResultSuccess<T> {
  return {
    type: SUCCESS,
    resource: makeResource(id, data),
  };
}

export function makeGetListResultSuccees(ids: Identifiable<ResourceId>[]): ResourceOpListResultSuccess {
  return {
    type: SUCCESS,
    resources: ids,
  };
}

// Results with errors has the same type for any operation
export function isResultError<E extends string>(
  result: ResourceOpResult<unknown, E> | ResourceOpListResult<E>
): result is ResourceOpResultError<E> {
  return result.type === ERROR;
}

// Successful Results for Get/Set and List operations are different
export function isGetSetResultSuccess<T>(result: ResourceOpResult<T, any>): result is ResourceOpResultSuccess<T> {
  return result.type === SUCCESS;
}

export function isGetListResultSuccess(result: ResourceOpListResult<any>): result is ResourceOpListResultSuccess {
  return result.type === SUCCESS;
}
