import { Success, Error, SUCCESS, ERROR, ResultKind } from './Result';

describe('ResultKinds should be comparable', () => {
  function compare(first: ResultKind, second: ResultKind) {
    return first === second;
  }

  it('Success', () => {
    const result: Success = SUCCESS;

    expect(compare(result, SUCCESS)).toBe(true);
    expect(compare(result, ERROR)).toBe(false);
  });

  it('Error', () => {
    const result: Error = ERROR;

    expect(compare(result, SUCCESS)).toBe(false);
    expect(compare(result, ERROR)).toBe(true);
  });
});
