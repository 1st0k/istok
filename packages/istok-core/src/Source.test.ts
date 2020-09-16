import {
  isGetListResultSuccess,
  isGetSetResultSuccess,
  isResultError,
  makeResultError,
  makeGetSetResultSuccess,
  UniformFiniteSource,
  makeGetListResultSuccees,
} from './Source';

describe('Source should be typed', () => {
  const INTENDED_ERROR = 'intended error' as const;
  type IntendedError = typeof INTENDED_ERROR;

  const successSource: UniformFiniteSource<string, IntendedError> = {
    get(id) {
      return Promise.resolve(makeGetSetResultSuccess(id, 'test resource data'));
    },
    set(id, data) {
      return Promise.resolve(makeGetSetResultSuccess(id, data));
    },
    getList() {
      return Promise.resolve(makeGetListResultSuccees([{ id: ['a', '1'] }]));
    },
  };

  const errorSource: UniformFiniteSource<string> = {
    get(id) {
      return Promise.resolve(makeResultError(`${INTENDED_ERROR} "get" with resource ${id.join('/')}`));
    },
    set(id, _) {
      return Promise.resolve(makeResultError(`${INTENDED_ERROR} "set" with resource ${id.join('/')}`));
    },
    getList() {
      return Promise.resolve(makeResultError(`${INTENDED_ERROR} "getMany"`));
    },
  };

  it('success result usage "get"', async done => {
    const result = await successSource.get(['a', 'b', 'c']);
    const isOk = isGetSetResultSuccess(result);

    expect(isOk).toBe(true);

    // we can't use "isOk" because TypeScript is not aware that result is GetResourceResultSuccss
    // therefore "result.resource" is unavailable without a hint
    if (isGetSetResultSuccess(result)) {
      expect(result.resource).toMatchObject(
        expect.objectContaining({
          data: expect.any(String),
          id: expect.any(Array),
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
      expect(result.resources).toEqual(expect.arrayContaining([{ id: ['a', '1'] }]));
    }

    done();
  });

  it('success result usage "set"', async done => {
    const result = await successSource.set(['a', 'b', 'c'], 'set to this data');
    const isOk = isGetSetResultSuccess(result);

    expect(isOk).toBe(true);

    if (isGetSetResultSuccess(result)) {
      expect(result.resource).toMatchObject(
        expect.objectContaining({
          data: expect.any(String),
          id: expect.any(Array),
        })
      );
    }

    done();
  });

  it('error result usage "get"', async done => {
    const result = await errorSource.get(['a', 'b', 'c']);
    const isError = isResultError(result);

    expect(isError).toBe(true);

    if (isResultError(result)) {
      expect(result.error).toMatch(INTENDED_ERROR);
    }

    done();
  });

  it('error result usage "set"', async done => {
    const result = await errorSource.set(['a', 'b', 'c'], 'will not set to this data');
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
