import { isGetSetResultSuccess } from '@istok/core';

import { startService } from './service';
import { createFirestoreSource } from './SourceFirestore';

function startFirebaseService() {
  return startService({
    envFilePath: '.env',
    debug: true,
  });
}

it.skip('should get a resource', async done => {
  const source = createFirestoreSource<{ data: any }>({
    firebase: startFirebaseService(),
    options: {
      root: 'test',
    },
  });

  const result = await Promise.all([
    source.get('doc'),
    source.get('resource/with/multipart/id'),
    source.get('not-existing'),
  ]);

  expect(isGetSetResultSuccess(result[0])).toBe(true);
  expect(isGetSetResultSuccess(result[1])).toBe(true);
  expect(isGetSetResultSuccess(result[2])).toBe(false);

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "kind": "success",
        "resource": Object {
          "data": Object {
            "data": "data 420",
            "pole": "polyshko",
            "test": "lol kek cheburek",
          },
          "id": "doc",
        },
      },
      Object {
        "kind": "success",
        "resource": Object {
          "data": Object {
            "value": "630",
          },
          "id": "resource/with/multipart/id",
        },
      },
      Object {
        "error": "Resource \\"not-existing\\" (path: \\"test/not-existing\\") is not exist.",
        "kind": "error",
      },
    ]
  `);

  done();
});

it.skip('should set a resource', async done => {
  const source = createFirestoreSource<{ value: number }>({
    firebase: startFirebaseService(),
    options: {
      root: 'test',
    },
  });

  const result = await source.set('new__resource__1', { value: 420 });

  expect(isGetSetResultSuccess(result)).toBe(true);

  if (isGetSetResultSuccess(result)) {
    expect(result.resource.data.value).toEqual(expect.any(Number));
  }

  done();
});

it.skip('should get list of resources', async done => {
  const source = createFirestoreSource({
    firebase: startFirebaseService(),
    options: {
      root: 'test',
    },
  });

  const result = await source.getList();

  expect(result).toMatchObject({
    resources: expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(String),
      }),
    ]),
  });

  done();
});
