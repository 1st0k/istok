/*
  Uniform Finite Source of Resources:
    - uniform resources (all resource have the same shape)
    - finite resources count at any given moment
*/

import {
  Identifiable,
  ERROR,
  SUCCESS,
  ResultSuccess,
  ResultError,
  makeResultError as makeResultErrorUtils,
  makeResultSuccess,
} from '@istok/utils';

import { ResourceId, Resource, makeResource } from './Resource';
/*
  Result of operations over Resource that affect whole Resource:
    - set Resource's data
    - get Resource
*/
export type ResourceOpResultSuccess<T> = ResultSuccess<{ resource: Resource<T> }>;
export type ResourceOpResultError<E> = ResultError<E>;
export type ResourceOpResult<D, E> = ResourceOpResultSuccess<D> | ResourceOpResultError<E>;

export type ResourceOpListResultSuccess = ResultSuccess<{ resources: Identifiable<ResourceId>[] }>;

export type ResourceOpListResult<E> = ResourceOpListResultSuccess | ResourceOpResultError<E>;

export const ERROR_RESOURCE_NOT_EXISTS = 'RESOURCE_NOT_EXISTS' as const;
export type ErrorResourceNotExists = typeof ERROR_RESOURCE_NOT_EXISTS;

export type ResourceListFilter = (id: ResourceId) => boolean;

export interface UniformFiniteSource<DataType, E> {
  get(resourceId: ResourceId): Promise<ResourceOpResult<DataType, E>>;
  set(resourceId: ResourceId, data: DataType): Promise<ResourceOpResult<DataType, E>>;

  getList(filter?: ResourceListFilter): Promise<ResourceOpListResult<E>>;
  clear(): Promise<ResourceOpListResult<E>>;
}

export type Source<DataType, E> = UniformFiniteSource<DataType, E>;

export function makeResultError<E>(error: E): ResourceOpResultError<E> {
  return makeResultErrorUtils(error);
}

export function makeGetSetResultSuccess<T>(id: ResourceId, data: T): ResourceOpResultSuccess<T> {
  return makeResultSuccess({
    resource: makeResource(id, data),
  });
}

export function makeGetListResultSuccees(ids: Identifiable<ResourceId>[]): ResourceOpListResultSuccess {
  return makeResultSuccess({
    resources: ids,
  });
}

// Results with errors has the same type for any operation
export function isResultError<E extends string>(
  result: ResourceOpResult<unknown, E> | ResourceOpListResult<E>
): result is ResourceOpResultError<E> {
  return result.kind === ERROR;
}

// Successful Results for Get/Set and List operations are different
export function isGetSetResultSuccess<T>(result: ResourceOpResult<T, any>): result is ResourceOpResultSuccess<T> {
  return result.kind === SUCCESS;
}

export function isGetListResultSuccess(result: ResourceOpListResult<any>): result is ResourceOpListResultSuccess {
  return result.kind === SUCCESS;
}
