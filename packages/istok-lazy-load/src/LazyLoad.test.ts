import { loadMap, makeLoadMap } from './';

describe('loadMap', () => {
  it('should load async map', async done => {
    const map = {
      a: () => Promise.resolve('a is loaded'),
      b: () => Promise.resolve('b is loaded'),
    };

    const result = await loadMap(map);

    expect(result).toMatchInlineSnapshot(`
          Object {
            "a": "a is loaded",
            "b": "b is loaded",
          }
      `);

    done();
  });

  it('should throw when atleast one of keys throws', async done => {
    const map = {
      a: () => Promise.resolve('a is loaded'),
      b: () => Promise.reject('b is rejected'),
    };

    loadMap(map)
      .then(() => expect(1).toBe(2))
      .catch(e => {
        expect(e).toMatchInlineSnapshot(`"b is rejected"`);
      })
      .finally(() => done());
  });
});

describe('makeLoadMap', () => {
  it('should make load map', () => {
    const map = makeLoadMap(['a', 'b'], element => Promise.resolve(`${element} is laoded`));

    expect(map).toMatchInlineSnapshot(`
      Object {
        "a": [Function],
        "b": [Function],
      }
    `);
  });
});

it('should load map made with makeLoadMap', async done => {
  const map = makeLoadMap(['a', 'b'], element => Promise.resolve(`${element} is laoded`));

  expect(await loadMap(map)).toMatchInlineSnapshot(`
    Object {
      "a": "a is laoded",
      "b": "b is laoded",
    }
  `);

  done();
});
