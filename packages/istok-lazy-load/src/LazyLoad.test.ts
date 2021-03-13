import { loadMap, makeLoadMap } from './';

describe('loadMap', () => {
  it('should load async map', async () => {
    const map = {
      a: () => Promise.resolve('a is loaded'),
      b: () => Promise.resolve('b is loaded'),
    };

    const result = await loadMap(map);

    expect(result).toMatchObject({
      a: expect.stringContaining('a is loaded'),
      b: expect.stringContaining('b is loaded'),
    });
  });

  it('should throw when atleast one of keys throws', async done => {
    const map = {
      a: () => Promise.resolve('a is loaded'),
      b: () => Promise.reject('b is rejected'),
    };

    loadMap(map)
      .catch(e => {
        expect(e).toMatchInlineSnapshot(`"b is rejected"`);
      })
      .finally(() => done());
  });
});

describe('makeLoadMap', () => {
  it('should make load map', () => {
    const map = makeLoadMap(['a', 'b'], element => Promise.resolve(`${element} is loaded`));

    expect(map).toMatchObject({
      a: expect.any(Function),
      b: expect.any(Function),
    });
  });
});

it('should load map made with makeLoadMap', async () => {
  const map = makeLoadMap(['a', 'b'], element => Promise.resolve(`${element} is loaded`));

  expect(await loadMap(map)).toMatchObject({
    a: expect.stringContaining('a is loaded'),
    b: expect.stringContaining('b is loaded'),
  });
});
