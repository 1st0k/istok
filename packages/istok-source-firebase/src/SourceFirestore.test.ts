import { isGetSetResultSuccess } from '@istok/core';
import { ERROR, SUCCESS } from '@istok/utils';

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

  expect(result[0] as any).toMatchObject({
    resource: expect.objectContaining({
      data: expect.any(Object),
      id: expect.any(String),
    }),
    kind: SUCCESS,
  });

  expect(result[1] as any).toMatchObject({
    resource: expect.objectContaining({
      data: expect.any(Object),
      id: expect.any(String),
    }),
    kind: SUCCESS,
  });

  expect(result[2] as any).toMatchObject({
    error: expect.stringMatching(/is not exist/),
    kind: ERROR,
  });

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
