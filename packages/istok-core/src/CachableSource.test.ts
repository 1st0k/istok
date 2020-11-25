import { createCachableSource } from './CachableSource';
import { createMemorySource } from './MemorySource';

describe('CachableSource', () => {
  it('should throw with no caches', () => {
    function execute() {
      createCachableSource({
        caches: [],
        source: createMemorySource(),
      });
    }

    expect(() => execute()).toThrowError(/at least 1 level of cache is required/);
  });

  it('should use 1 level cache', async done => {
    const cacheSource = createMemorySource();
    const s = createCachableSource({
      caches: [
        {
          source: cacheSource,
        },
      ],
      source: createMemorySource({
        initialResources: {
          a: 'resource a data',
          b: 'resource b data',
        },
      }),
    });

    expect(await s.get('a')).toMatchInlineSnapshot(`
      Object {
        "kind": "success",
        "resource": Object {
          "data": "resource a data",
          "id": "a",
        },
      }
    `);

    expect(await cacheSource.get('a')).toMatchInlineSnapshot(`
      Object {
        "kind": "success",
        "resource": Object {
          "data": "resource a data",
          "id": "a",
        },
      }
    `);

    done();
  });

  it('should filter out resources', async done => {
    const source = createCachableSource({
      caches: [
        {
          source: createMemorySource(),
        },
      ],
      source: createMemorySource({
        initialResources: {
          'ok-1': 'ok',
          'ok-2': 'ok',
          'filter-me-out': 'not ok',
        },
      }),
    });

    const result = await source.getList(id => id.includes('ok'));

    expect(result).toMatchInlineSnapshot(`
      Object {
        "kind": "success",
        "resources": Array [
          Object {
            "id": "ok-1",
          },
          Object {
            "id": "ok-2",
          },
        ],
      }
    `);
    done();
  });
});
