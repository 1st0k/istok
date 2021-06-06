/*
  Uniform Source of Identifiable Entities
*/
import { Result, ResultError, ResultSuccess } from './Result';
import { Id } from './Entity';

export const ERROR_GENERIC = 'ERROR' as const;
export type GenericError = typeof ERROR_GENERIC;

export const SUCCESS_GENERIC = 'OK' as const;
export type GenericSuccess = typeof SUCCESS_GENERIC;

export type QueryFilter = (id: Id) => boolean;

export interface QueryParams {
  offset: number;
  limit: number;
  filter?: QueryFilter;
}

export interface QueryPartialResult {
  next: QueryParams | null;
  prev: QueryParams | null;
}

export type QueryResult<T> = ResultSuccess<T[]> & QueryPartialResult;

export interface Source<T> {
  get(id: Id): Promise<Result<T, string>>;
  set(id: Id, entity: T): Promise<Result<GenericSuccess, string>>;

  delete(id: Id): Promise<Result<GenericSuccess, string>>;
  clear(): Promise<Result<GenericSuccess, string>>;

  query(params: QueryParams): Promise<QueryResult<T> | ResultError<string>>;
}
