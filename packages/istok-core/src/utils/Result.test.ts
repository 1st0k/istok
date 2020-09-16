import { Success, Error, SUCCESS, ERROR, ERROR_KEY, SUCCESS_KEY, Result } from './Result';

describe('Results should be distinguishable', () => {
  it('Success', () => {
    const result: Success = SUCCESS;
    expect(result).toBe(SUCCESS_KEY);
  });

  it('Error', () => {
    const result: Error = ERROR;
    expect(result).toBe(ERROR_KEY);
  });
});

describe('Results should be comparable', () => {
  function compare(first: Result, second: Result) {
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
