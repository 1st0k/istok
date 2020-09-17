import { errorSource, INTENDED_ERROR, successSource } from './mocks/sources';
import { isGetListResultSuccess, isGetSetResultSuccess, isResultError } from './Source';

describe('Source should be typed', () => {
  it('success result usage "get"', async done => {
    const result = await successSource.get('a/1');
    const isOk = isGetSetResultSuccess(result);

    expect(isOk).toBe(true);

    // we can't use "isOk" because TypeScript is not aware that result is GetResourceResultSuccss
    // therefore "result.resource" is unavailable without a hint
    if (isGetSetResultSuccess(result)) {
      expect(result.resource).toMatchObject(
        expect.objectContaining({
          data: expect.any(String),
          id: expect.any(String),
        })
      );
    }

    done();
  });

  it('success result usage "getList"', async done => {
    const result = await successSource.getList();
    const isOk = isGetListResultSuccess(result);

    expect(isOk).toBe(true);

    if (isGetListResultSuccess(result)) {
      expect(result.resources).toEqual(expect.arrayContaining([{ id: 'a/1' }]));
    }

    done();
  });

  it('success result usage "set"', async done => {
    const result = await successSource.set('a/1', 'set to this data');
    const isOk = isGetSetResultSuccess(result);

    expect(isOk).toBe(true);

    if (isGetSetResultSuccess(result)) {
      expect(result.resource).toMatchObject(
        expect.objectContaining({
          data: expect.any(String),
          id: expect.any(String),
        })
      );
    }

    done();
  });

  it('error result usage "get"', async done => {
    const result = await errorSource.get('a/1');
    const isError = isResultError(result);

    expect(isError).toBe(true);

    if (isResultError(result)) {
      expect(result.error).toMatch(INTENDED_ERROR);
    }

    done();
  });

  it('error result usage "set"', async done => {
    const result = await errorSource.set('a/1', 'will not set to this data');
    const isError = isResultError(result);

    expect(isError).toBe(true);

    if (isResultError(result)) {
      expect(result.error).toMatch(INTENDED_ERROR);
    }

    done();
  });

  it('error result usage "getList"', async done => {
    const result = await errorSource.getList();
    const isOk = isResultError(result);

    expect(isOk).toBe(true);

    if (!isGetListResultSuccess(result)) {
      expect(result.error).toMatch(INTENDED_ERROR);
    }

    done();
  });
});
