import { Brand, AnyBrand, BaseOf, Brander } from './Brand';
import { ErrorKey, SuccessKey, Error, Success, ResultKind, Result, ResultSuccess, ResultError } from './Result';
import { IdString, IdStringArray, Identifiable } from './Identificator';

export { identity, make, unwrap } from './Brand';
export { ERROR_KEY, SUCCESS_KEY, ERROR, SUCCESS, makeResultError, makeResultSuccess } from './Result';

export { Brand, AnyBrand, BaseOf, Brander };
export { ErrorKey, SuccessKey, Error, Success, ResultKind, Result, ResultSuccess, ResultError };
export { IdString, IdStringArray, Identifiable };

export function meta() {
  return {
    name: `utils`,
    description: `The most abstract low level utilities.`,
  };
}
