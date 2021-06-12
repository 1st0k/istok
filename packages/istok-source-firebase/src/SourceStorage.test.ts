import { startService, Firebase } from './service';
import { createFirebaseStorageSource } from './SourceStorage';

import { envFilePath } from './test-utils';

let firebase: Firebase | null = null;
let bucket: string = '';

beforeAll(async () => {
  jest.setTimeout(30000);

  await startFirebaseService();
  if (!process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
    throw new Error(`No FIREBASE_STORAGE_EMULATOR_HOST was set. Aborting tests in non-emulated environment!`);
  }
  bucket = process.env.FIREBASE_STORAGE_BUCKET as string;
});

async function startFirebaseService() {
  if (!firebase) {
    firebase = startService({
      envFilePath,
      debug: true,
      projectId: 'demo-istok',
      defaultBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  try {
    await firebase.app
      .storage()
      .bucket()
      .file('test/a')
      .save('aaaa');
    await firebase.app
      .storage()
      .bucket()
      .file('test/b')
      .save('bbbbbb');
    await firebase.app
      .storage()
      .bucket()
      .file('test/c')
      .save('ccccc');
  } catch (e) {
    console.log(e);
  }
}

it('should get a resource', async () => {
  const source = createFirebaseStorageSource({
    firebase: firebase!,
    options: {
      root: 'test',
      bucket,
    },
  });

  const result = await Promise.all([source.get('a'), source.get('b'), source.get('not-existing')]);

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "error": "Error: Not Found",
        "kind": "Error",
      },
      Object {
        "error": "Error: Not Found",
        "kind": "Error",
      },
      Object {
        "error": "Error: Not Found",
        "kind": "Error",
      },
    ]
  `);
});

it('should set a resource', async () => {
  const source = createFirebaseStorageSource({
    firebase: firebase!,
    options: {
      root: 'test',
      bucket,
    },
  });

  const result = await source.set('new__resource__1', '420!');

  expect(result).toMatchInlineSnapshot(`
    Object {
      "data": "OK",
      "kind": "Success",
    }
  `);
});

it('should remove a resource', async () => {
  const source = createFirebaseStorageSource({
    firebase: firebase!,
    options: {
      root: 'test',
      bucket,
    },
  });

  const setResult = await source.set('new__resource__2', '420!');
  if (setResult.kind !== 'Success') {
    throw new Error('Unable to add file');
  }
  const result = await source.delete('new__resource__2');

  expect(result).toMatchInlineSnapshot(`
    Object {
      "data": "OK",
      "kind": "Success",
    }
  `);

  expect(await source.get('new__resource__2')).toMatchInlineSnapshot(`
    Object {
      "error": "Error: Not Found",
      "kind": "Error",
    }
  `);
});

it('should get list of resources', async done => {
  const source = createFirebaseStorageSource({
    firebase: firebase!,
    options: {
      root: 'test',
      bucket,
    },
  });

  const result = await source.query({});

  expect(result).toMatchObject({
    resources: expect.arrayContaining([
      expect.objectContaining({
        id: expect.not.stringContaining('test/'),
      }),
    ]),
  });

  done();
});

it.skip('should clear list of resources', async done => {
  const source = createFirebaseStorageSource({
    firebase: firebase!,
    options: {
      bucket,
      root: 'test-remove',
    },
  });

  await source.clear();
  const result = await source.query({});

  expect(result).toMatchObject({
    resources: expect.arrayContaining([]),
  });

  done();
});
