import { Brand, identity } from './branding';

export const ERROR_KEY = 'error' as const;
export const SUCCESS_KEY = 'success' as const;

export type ErrorKey = typeof ERROR_KEY;
export type SuccessKey = typeof SUCCESS_KEY;

export type Error = Brand<ErrorKey, ErrorKey>;
export type Success = Brand<SuccessKey, SuccessKey>;

export type Result = Error | Success;

export const ERROR = identity<Error>(ERROR_KEY);
export const SUCCESS = identity<Success>(SUCCESS_KEY);
