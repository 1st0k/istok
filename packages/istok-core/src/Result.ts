export type ResultKind = 'Sucess' | 'Error';

export type ResultSuccess<T> = { kind: 'Success'; data: T };
export type ResultError<E> = { kind: 'Error'; error: E };

export type Result<T, E> = ResultSuccess<T> | ResultError<E>;

export function error<E = unknown>(error: E): ResultError<E> {
  return {
    kind: 'Error',
    error,
  };
}

export function success<T = unknown>(data: T): ResultSuccess<T> {
  return {
    kind: 'Success',
    data,
  };
}

export function successExt<T = unknown, Ext = unknown>(data: T, ext: Ext): ResultSuccess<T> & Ext {
  return {
    kind: 'Success',
    data,
    ...ext,
  };
}
