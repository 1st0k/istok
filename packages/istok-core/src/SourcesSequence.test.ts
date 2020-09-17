import { createSourcesSequence } from './SourcesSequence';
import { createMemorySource } from './MemorySource';
import { ERROR_RESOURCE_NOT_EXISTS, isGetListResultSuccess } from './Source';

import { successSource } from './mocks/sources';
import { ERROR, SUCCESS } from './utils/Result';

it('should throw if no Sources were provided', () => {
  function init() {
    createSourcesSequence([]);
  }
  expect(() => init()).toThrow();
});

describe('SourcesSequence get resource', () => {
  it('return error if Resource is not exist on Source', async done => {
    const ss = createSourcesSequence([
      {
        source: createMemorySource({
          initialResources: {
            'unused-resource': 420,
          },
        }),
      },
    ]);

    const resource = await ss.get('a/1');

    expect(resource).toMatchObject(
      expect.objectContaining({
        error: ERROR_RESOURCE_NOT_EXISTS,
        type: ERROR,
      })
    );
    done();
  });

  it('get resource with 1 source', async done => {
    const ss = createSourcesSequence([
      {
        source: successSource,
      },
    ]);

    const resource = await ss.get('a/1');

    expect(resource).toMatchObject(
      expect.objectContaining({
        resource: expect.objectContaining({
          data: expect.any(String),
          id: expect.any(String),
        }),
        type: 'success',
      })
    );
    done();
  });

  it('get resource from 2 sources if last source has Resource', async done => {
    const ss = createSourcesSequence([
      {
        source: createMemorySource(),
      },
      {
        source: successSource,
      },
    ]);

    const resource = await ss.get('a/1');

    expect(resource).toMatchObject(
      expect.objectContaining({
        resource: expect.objectContaining({
          data: expect.any(String),
          id: expect.any(String),
        }),
        type: SUCCESS,
      })
    );
    done();
  });
});

describe('SourcesSequence set Resource', () => {
  it('with 2 sources', async done => {
    const ss = createSourcesSequence([
      {
        source: createMemorySource(),
      },
      {
        source: createMemorySource(),
      },
    ]);

    await ss.set('resource', 42069);

    const result = await ss.sources[0].get('resource');

    expect(result).toMatchObject(
      expect.objectContaining({
        resource: expect.objectContaining({
          data: 42069,
        }),
      })
    );
    done();
  });
});

describe('SourcesSequence backpropagates Resource', () => {
  it('with 2 sources', async done => {
    const ss = createSourcesSequence([
      {
        source: createMemorySource(),
      },
      {
        source: createMemorySource({ initialResources: { resource: 42069 } }),
      },
    ]);

    await ss.get('resource');

    const result = await ss.sources[0].get('resource');

    expect(result).toMatchObject(
      expect.objectContaining({
        resource: expect.objectContaining({
          data: 42069,
        }),
      })
    );
    done();
  });
});

describe('SourcesSequence getList', () => {
  it('should return list of resources from last source if "sourceIndex" is not specified', async done => {
    const ss = createSourcesSequence([
      {
        source: createMemorySource({ initialResources: { firstSourceResourceA: 69, firstSourceResourceB: 69 } }),
      },
      {
        source: createMemorySource({ initialResources: { secondSourceResource: 420 } }),
      },
    ]);

    const list = await ss.getList();

    expect(isGetListResultSuccess(list)).toBe(true);

    if (isGetListResultSuccess(list)) {
      expect(list.resources.length).toBe(1);
      expect(list.resources[0].id).toEqual(expect.any(String));
    }

    done();
  });

  it('should return list of resources from source with "sourceIndex"', async done => {
    const ss = createSourcesSequence([
      {
        source: createMemorySource({ initialResources: { firstSourceResourceA: 69, firstSourceResourceB: 69 } }),
      },
      {
        source: createMemorySource({ initialResources: { secondSourceResource: 420 } }),
      },
    ]);

    const list = await ss.getList(0);

    expect(isGetListResultSuccess(list)).toBe(true);

    if (isGetListResultSuccess(list)) {
      expect(list.resources.length).toBe(2);
      expect(list.resources[0].id).toEqual(expect.any(String));
      expect(list.resources[1].id).toEqual(expect.any(String));
    }

    done();
  });
});
