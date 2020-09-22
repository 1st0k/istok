import { startService } from './service';
import { createFirestoreSource } from './SourceFirestore';

function startFirebaseService() {
  return startService({
    envFilePath: '.env',
    debug: true,
  });
}

it.skip('should get a resource', async done => {
  const source = createFirestoreSource({
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

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "resource": Object {
          "data": Object {
            "data": "data 420",
            "pole": "polyshko",
            "test": "lol kek cheburek",
          },
          "id": "doc",
        },
        "type": "success",
      },
      Object {
        "resource": Object {
          "data": Object {
            "value": "630",
          },
          "id": "resource/with/multipart/id",
        },
        "type": "success",
      },
      Object {
        "error": "Resource \\"not-existing\\" (path: \\"test/not-existing\\") is not exist.",
        "type": "error",
      },
    ]
  `);

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

  expect(result).toMatchInlineSnapshot(`
    Object {
      "resources": Array [
        Object {
          "id": "doc",
        },
        Object {
          "id": "resource/with/multipart/id",
        },
      ],
      "type": "success",
    }
  `);

  done();
});
