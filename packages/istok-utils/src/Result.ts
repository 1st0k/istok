import { Brand, identity } from './Brand';

export const ERROR_KEY = 'error' as const;
export const SUCCESS_KEY = 'success' as const;

export type ErrorKey = typeof ERROR_KEY;
export type SuccessKey = typeof SUCCESS_KEY;

export type Error = Brand<ErrorKey, ErrorKey>;
export type Success = Brand<SuccessKey, SuccessKey>;

export type ResultKind = Error | Success;

export const ERROR = identity<Error>(ERROR_KEY);
export const SUCCESS = identity<Success>(SUCCESS_KEY);

export type ResultSuccess<T> = { kind: Success } & T;
export type ResultError<T> = { kind: Error; error: T };

export type Result<T, E> = ResultSuccess<T> | ResultError<E>;

export function makeResultError<T>(error: T): ResultError<T> {
  return {
    kind: ERROR,
    error,
  };
}

export function makeResultSuccess<T>(result: T): ResultSuccess<T> {
  return {
    kind: SUCCESS,
    ...result,
  };
}
