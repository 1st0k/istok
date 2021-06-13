import { createMemorySource, createCachableSource } from '@istok/core';
import { createFilesystemSource } from '.';

import { mockResourcesPath } from './testUtils';

it('should be used as a cache', async done => {
  const fs = createFilesystemSource({
    root: mockResourcesPath('as-cache'),
    autoCreateRoot: true,
    writeTransform(t) {
      return JSON.stringify(t);
    },
    readTransform(t: string) {
      return JSON.parse(t);
    },
  });

  const cachedSource = createCachableSource({
    caches: [
      {
        source: fs,
        invalidateOnInit: true,
      },
    ],
    source: createMemorySource({
      initialResources: {
        'res-1': {
          'res-1-data': 420,
        },
      },
    }),
  });
  await cachedSource.get('res-1');

  const cached = await fs.get('res-1');

  expect(cached).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "entity": Object {
          "res-1-data": 420,
        },
        "id": "res-1",
      },
      "kind": "Success",
    }
  `);
  done();
});

it('should be used as a cache and as source', async done => {
  const fs = createFilesystemSource({
    root: mockResourcesPath('cache-from-source'),
    autoCreateRoot: true,
  });

  const ss = createFilesystemSource({
    root: mockResourcesPath('resources'),
  });

  const cachedSource = createCachableSource({
    caches: [
      {
        source: fs,
        invalidateOnInit: true,
      },
    ],
    source: ss,
  });

  await cachedSource.get('res-1/1');

  const cached = await fs.get('res-1/1');

  expect(cached).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "entity": "res-1 data",
        "id": "res-1/1",
      },
      "kind": "Success",
    }
  `);
  done();
});
