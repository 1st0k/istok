import { isGetSetResultSuccess } from '@istok/core';
import { ERROR, SUCCESS } from '@istok/utils';

import { startService } from './service';
import { createFirebaseStorageSource } from './SourceStorage';

function startFirebaseService() {
  return startService({
    envFilePath: '.env',
    debug: true,
  });
}

const bucket = process.env.FIREBASE_STORAGE_BUCKET || '';

it.skip('should get a resource', async done => {
  const source = createFirebaseStorageSource({
    firebase: startFirebaseService(),
    options: {
      root: 'test',
      bucket,
    },
  });

  const result = await Promise.all([source.get('a'), source.get('b'), source.get('not-existing')]);

  expect(isGetSetResultSuccess(result[0])).toBe(true);
  expect(isGetSetResultSuccess(result[1])).toBe(true);
  expect(isGetSetResultSuccess(result[2])).toBe(false);

  expect(result[0] as any).toMatchObject({
    resource: expect.objectContaining({
      data: expect.any(String),
      id: expect.any(String),
    }),
    kind: SUCCESS,
  });

  expect(result[1] as any).toMatchObject({
    resource: expect.objectContaining({
      data: expect.any(String),
      id: expect.any(String),
    }),
    kind: SUCCESS,
  });

  expect(result[2] as any).toMatchObject({
    error: expect.stringMatching(/No such object:/),
    kind: ERROR,
  });

  done();
});

it.skip('should set a resource', async done => {
  const source = createFirebaseStorageSource({
    firebase: startFirebaseService(),
    options: {
      root: 'test',
      bucket,
    },
  });

  const result = await source.set('new__resource__1', '420!');

  expect(isGetSetResultSuccess(result)).toBe(true);

  if (isGetSetResultSuccess(result)) {
    expect(result.resource.data).toEqual(expect.any(String));
  }

  done();
});

it.skip('should get list of resources', async done => {
  const source = createFirebaseStorageSource({
    firebase: startFirebaseService(),
    options: {
      root: 'test',
      bucket,
    },
  });

  const result = await source.getList();

  expect(result).toMatchObject({
    resources: expect.arrayContaining([
      expect.objectContaining({
        id: expect.not.stringContaining('test/'),
      }),
    ]),
  });

  done();
});
