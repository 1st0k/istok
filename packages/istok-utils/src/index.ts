import { Brand, AnyBrand, BaseOf, Brander } from './Brand';
import { ErrorKey, SuccessKey, Error, Success, Result } from './Result';
import { IdString, IdStringArray, Identifiable } from './Identificator';

export { identity, make, unwrap } from './Brand';
export { ERROR_KEY, SUCCESS_KEY, ERROR, SUCCESS } from './Result';

export { Brand, AnyBrand, BaseOf, Brander };
export { ErrorKey, SuccessKey, Error, Success, Result };
export { IdString, IdStringArray, Identifiable };

export function meta() {
  return {
    name: `utils`,
    description: `The most abstract low level utilities.`,
  };
}
