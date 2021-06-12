import { startService, Firebase } from './service';
import { createFirestoreSource } from './SourceFirestore';

import { envFilePath } from './test-utils';

let firebase: Firebase | null = null;

const ROOT = 'istok-test';

beforeAll(async () => {
  jest.setTimeout(30000);

  await startFirebaseService();
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error(`No FIRESTORE_EMULATOR_HOST was set. Aborting tests in non-emulated environment!`);
  }
});

async function startFirebaseService() {
  firebase = startService({
    envFilePath,
    debug: true,
    projectId: 'demo-istok',
  });

  await Promise.all([
    firebase.app
      .firestore()
      .doc(`${ROOT}/doc`)
      .set({ value: `test doc !!!` }),
    firebase.app
      .firestore()
      .doc(`${ROOT}/resource__with__multipart__id`)
      .set({ value: `test doc` }),
    firebase.app
      .firestore()
      .doc(`${ROOT}-remove/doc`)
      .set({ value: `test doc` }),
  ]);

  return firebase;
}

it('should get a resource', async () => {
  const source = createFirestoreSource<{ data: any }>({
    firebase: firebase!,
    options: {
      root: ROOT,
    },
  });

  const result = await Promise.all([
    source.get('doc'),
    source.get('resource/with/multipart/id'),
    source.get('not-existing'),
  ]);

  expect(result[0]).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "entity": Object {
          "value": "test doc !!!",
        },
        "id": "doc",
      },
      "kind": "Success",
    }
  `);
  expect(result[1]).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "entity": Object {
          "value": "test doc",
        },
        "id": "resource/with/multipart/id",
      },
      "kind": "Success",
    }
  `);
  expect(result[2]).toMatchInlineSnapshot(`
    Object {
      "error": "Resource \\"not-existing\\" (path: \\"istok-test/not-existing\\") is not exist.",
      "kind": "Error",
    }
  `);
});

it('should set a resource', async () => {
  const source = createFirestoreSource<{ value: number }>({
    firebase: firebase!,
    options: {
      root: `${ROOT}-add`,
    },
  });

  const resourceId = 'new__resource__1';
  const resourceData = { value: 420 };

  const setResult = await source.set(resourceId, resourceData);
  const readResult = await source.get(resourceId);

  expect(setResult.kind === 'Success').toBe(true);
  expect(readResult.kind === 'Success').toBe(true);
  expect(readResult).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "entity": Object {
          "value": 420,
        },
        "id": "new__resource__1",
      },
      "kind": "Success",
    }
  `);
});

it('should remove a resource', async () => {
  const source = createFirestoreSource<{ value: number }>({
    firebase: firebase!,
    options: {
      root: `${ROOT}-add`,
    },
  });

  const resourceId = 'new__resource__1';
  const resourceData = { value: 420 };

  await source.set(resourceId, resourceData);
  await source.delete(resourceId);
  const readResult = await source.get(resourceId);

  expect(readResult).toMatchInlineSnapshot(`
    Object {
      "error": "Resource \\"new__resource__1\\" (path: \\"istok-test-add/new__resource__1\\") is not exist.",
      "kind": "Error",
    }
  `);
});

it('should get list of resources', async () => {
  const source = createFirestoreSource({
    firebase: firebase!,
    options: {
      root: ROOT,
    },
  });

  const result = await source.query({});

  expect(result).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        Object {
          "entity": Object {
            "value": "test doc !!!",
          },
          "id": "doc",
        },
        Object {
          "entity": Object {
            "value": "test doc",
          },
          "id": "resource/with/multipart/id",
        },
      ],
      "kind": "Success",
      "next": null,
      "prev": null,
    }
  `);
});

it('should get ids of resources', async () => {
  const source = createFirestoreSource({
    firebase: firebase!,
    options: {
      root: ROOT,
    },
  });

  const result = await source.ids({});

  expect(result).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        "doc",
        "resource/with/multipart/id",
      ],
      "kind": "Success",
      "next": null,
      "prev": null,
    }
  `);
});

it('should clear list of resources', async () => {
  const source = createFirestoreSource({
    firebase: firebase!,
    options: {
      root: `${ROOT}-remove`,
    },
  });

  await source.clear();
  const result = await source.query({});

  expect(result).toMatchObject({
    data: expect.arrayContaining([]),
  });
});
