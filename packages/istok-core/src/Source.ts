/*
  Uniform Source of Identifiable Entities
*/
import { Result, ResultError, ResultSuccess } from './Result';
import { Id, Entity, EntityRespone } from './Entity';

export const ERROR_GENERIC = 'ERROR' as const;
export type GenericError = typeof ERROR_GENERIC;

export const SUCCESS_GENERIC = 'OK' as const;
export type GenericSuccess = typeof SUCCESS_GENERIC;

export type GenericResult = Result<GenericSuccess, string>;

export type QueryFilter = (id: Id) => boolean;

export interface QueryParams {
  offset?: number;
  limit?: number;
  filter?: QueryFilter;
}

export interface QueryPartialResult {
  next: QueryParams | null;
  prev: QueryParams | null;
  total?: number;
}

export type QueryResult<T> = ResultSuccess<T[]> & QueryPartialResult;

export interface Source<T> {
  get(id: Id): Promise<EntityRespone<T> | ResultError>;
  set(id: Id, entity: T): Promise<GenericResult>;

  delete(id: Id): Promise<GenericResult>;
  clear(): Promise<GenericResult>;

  query(params: QueryParams): Promise<QueryResult<Entity<T>> | ResultError>;
  ids(params: QueryParams): Promise<QueryResult<Id> | ResultError>;
}
