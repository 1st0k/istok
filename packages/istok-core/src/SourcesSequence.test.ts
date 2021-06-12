import { createSourceSequence } from './SourceSequence';
import { createMemorySource } from './MemorySource';

import { successSource } from './mocks/sources';

it('should throw if no Sources were provided', () => {
  function init() {
    createSourceSequence({ sources: [] });
  }
  expect(() => init()).toThrow();
});

describe('SourcesSequence get resource', () => {
  it('return error if Resource is not exist on Source', async done => {
    const ss = createSourceSequence({
      sources: [
        createMemorySource({
          initialResources: {
            'unused-resource': 420,
          },
        }),
      ],
    });

    const resource = await ss.getFirst('a/1');

    expect(resource).toMatchObject(
      expect.objectContaining({
        error: expect.stringMatching(/No resource/),
        kind: 'Error',
      })
    );
    done();
  });

  it('get resource with 1 source', async () => {
    const ss = createSourceSequence({
      sources: [successSource],
    });

    const resource = await ss.getFirst('a/1');

    expect(resource).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "entity": "test resource data",
          "id": "a/1",
        },
        "kind": "Success",
        "source": Object {
          "index": 0,
        },
      }
    `);
  });

  it('get resource from 2 sources if last source has Resource', async () => {
    const ss = createSourceSequence({
      sources: [createMemorySource(), successSource],
    });

    const resource = await ss.getFirst('a/1');

    expect(resource).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "entity": "test resource data",
          "id": "a/1",
        },
        "kind": "Success",
        "source": Object {
          "index": 1,
        },
      }
    `);
  });
});

describe('SourcesSequence set Resource', () => {
  it('with 2 sources', async () => {
    const ss = createSourceSequence({
      sources: [createMemorySource(), createMemorySource()],
    });

    await ss.set('resource', 42069);

    const result = await ss.getSources()[0].get('resource');

    expect(result).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "entity": 42069,
          "id": "resource",
        },
        "kind": "Success",
      }
    `);
  });
});

describe('SourcesSequence queryFirst', () => {
  it('should return list of resources from last source in "inverse" mode', async () => {
    const ss = createSourceSequence({
      sources: [
        createMemorySource({ initialResources: { firstSourceResourceA: 69, firstSourceResourceB: 69 } }),
        createMemorySource({ initialResources: { secondSourceResource: 420 } }),
      ],
    });

    const list = await ss.queryFirst({ limit: 0, offset: 0 }, true);

    expect(list.kind).toBe('Success');

    if (list.kind === 'Success') {
      expect(list.data.length).toBe(1);
      expect(list.data[0].id).toEqual(expect.any(String));
    }
  });
});

describe('SourcesSequence clear', () => {
  it('should remove all resources from every source', async done => {
    const ss = createSourceSequence({
      sources: [
        createMemorySource({ initialResources: { firstSourceResourceA: 69, firstSourceResourceB: 69 } }),
        createMemorySource({ initialResources: { secondSourceResource: 420 } }),
      ],
    });

    await ss.clear();

    const results = await Promise.all([ss.getFirst('firstSourceResourceA'), ss.getFirst('secondSourceResource')]);

    expect(results[0]).toMatchInlineSnapshot(`
      Object {
        "error": "400::No resource with id \\"firstSourceResourceA\\" on any source within interval [0, 1]",
        "kind": "Error",
      }
    `);
    expect(results[1]).toMatchInlineSnapshot(`
      Object {
        "error": "400::No resource with id \\"secondSourceResource\\" on any source within interval [0, 1]",
        "kind": "Error",
      }
    `);

    done();
  });
});
