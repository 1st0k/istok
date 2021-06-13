import { startService, Firebase } from './service';
import { createFirebaseStorageSource } from './SourceStorage';

import { envFilePath } from './test-utils';

let firebase: Firebase | null = null;
let bucket: string = '';

function createSource(root = 'test', filter = undefined) {
  return createFirebaseStorageSource({
    firebase: firebase!,
    options: {
      root,
      bucket,
      noValidate: true,
      entityPathFilter: filter,
    },
  });
}

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
    await firebase.app
      .storage()
      .bucket()
      .file('test2/a')
      .save('test2-aaaaaa');
  } catch (e) {
    console.log(e);
  }
}

it('should get a resource', async () => {
  const source = createSource();

  const result = await Promise.all([source.get('a'), source.get('b'), source.get('not-existing')]);

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "data": Object {
          "entity": "aaaa",
          "id": "a",
        },
        "kind": "Success",
      },
      Object {
        "data": Object {
          "entity": "bbbbbb",
          "id": "b",
        },
        "kind": "Success",
      },
      Object {
        "error": "Error: Not Found",
        "kind": "Error",
      },
    ]
  `);
});

it('should set a resource', async () => {
  const source = createSource();

  const result = await source.set('new__resource__1', '420!');

  expect(result).toMatchInlineSnapshot(`
    Object {
      "data": "OK",
      "kind": "Success",
    }
  `);
});

it('should remove a resource', async () => {
  const source = createSource();

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

it('should query Ids of resources', async () => {
  const source = createSource();

  const result = await source.ids({
    filter(id) {
      return id.length === 1;
    },
  });

  expect(result).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        "a",
        "b",
        "c",
        "new__resource__1",
      ],
      "kind": "Success",
      "next": null,
      "prev": null,
      "total": 4,
    }
  `);
});

it('should query resources', async () => {
  const source = createSource();

  const result = await source.query({});

  expect(result).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        Object {
          "entity": "aaaa",
          "id": "a",
        },
        Object {
          "entity": "bbbbbb",
          "id": "b",
        },
        Object {
          "entity": "ccccc",
          "id": "c",
        },
        Object {
          "entity": "420!",
          "id": "new__resource__1",
        },
      ],
      "kind": "Success",
      "next": null,
      "prev": null,
      "total": 4,
    }
  `);

  expect(await source.query({ limit: 1 })).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        Object {
          "entity": "aaaa",
          "id": "a",
        },
      ],
      "kind": "Success",
      "next": null,
      "prev": null,
      "total": 4,
    }
  `);

  expect(await source.query({ limit: 1, offset: 3 })).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        Object {
          "entity": "420!",
          "id": "new__resource__1",
        },
      ],
      "kind": "Success",
      "next": null,
      "prev": null,
      "total": 4,
    }
  `);
});

it.skip('should clear list of resources', async done => {
  const source = createSource('test-remove');

  await source.clear();
  const result = await source.query({});

  expect(result).toMatchObject({
    resources: expect.arrayContaining([]),
  });

  done();
});
