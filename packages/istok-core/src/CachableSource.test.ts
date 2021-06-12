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

    expect(() => execute()).toThrowError(/cache source is required/);
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
        "data": Object {
          "entity": "resource a data",
          "id": "a",
        },
        "kind": "Success",
        "source": Object {
          "index": 1,
        },
      }
    `);

    expect(await cacheSource.get('a')).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "entity": "resource a data",
          "id": "a",
        },
        "kind": "Success",
      }
    `);

    done();
  });

  it('should filter out resources', async done => {
    const source = createCachableSource({
      caches: [
        {
          source: createMemorySource({
            name: 'empty cache',
          }),
        },
      ],
      source: createMemorySource({
        name: 'where all resources',
        initialResources: {
          'ok-1': 'ok',
          'ok-2': 'ok',
          'filter-me-out': 'not ok',
        },
      }),
    });

    const result = await source.query({ limit: 0, offset: 0, filter: id => id.includes('ok') });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "data": Array [
          Object {
            "entity": "ok",
            "id": "ok-1",
          },
          Object {
            "entity": "ok",
            "id": "ok-2",
          },
        ],
        "kind": "Success",
        "next": null,
        "prev": null,
        "source": Object {
          "index": 1,
        },
        "total": 3,
      }
    `);
    done();
  });
});
