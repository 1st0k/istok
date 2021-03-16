import { isGetSetResultSuccess } from '@istok/core';
import { ERROR, SUCCESS } from '@istok/utils';

import { startService, Firebase } from './service';
import { createFirestoreSource } from './SourceFirestore';

import { envFilePath } from './test-utils';

let firebase: Firebase | null = null;

beforeAll(async () => {
  jest.setTimeout(30000);

  await startFirebaseService();
});

async function startFirebaseService() {
  firebase = startService({
    envFilePath,
    debug: true,
  });

  await firebase.firestore().doc('test/doc').set({ value: 'test doc' });
  await firebase.firestore().doc('test/resource__with__multipart__id').set({ value: 'test doc' });
  await firebase.firestore().doc('test-remove/doc').set({ value: 'test doc' });

  return firebase;
}

it.skip('should get a resource', async () => {
  const source = createFirestoreSource<{ data: any }>({
    firebase: firebase!,
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
});

it.skip('should set a resource', async () => {
  const source = createFirestoreSource<{ value: number }>({
    firebase: firebase!,
    options: {
      root: 'test-add',
    },
  });

  const resourceId = 'new__resource__1';
  const resourceData = { value: 420 };

  const setResult = await source.set(resourceId, resourceData);
  const readResult = await source.get(resourceId);

  expect(isGetSetResultSuccess(setResult)).toBe(true);
  expect(isGetSetResultSuccess(readResult)).toBe(true);
  expect((readResult as any).resource.data).toEqual(resourceData);
});

it.skip('should get list of resources', async () => {
  const source = createFirestoreSource({
    firebase: firebase!,
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
});

it.skip('should clear list of resources', async () => {
  const source = createFirestoreSource({
    firebase: firebase!,
    options: {
      root: 'test-remove',
    },
  });

  await source.clear();
  const result = await source.getList();

  expect(result).toMatchObject({
    resources: expect.arrayContaining([]),
  });
});
