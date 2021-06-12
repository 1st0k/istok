import path from 'path';
import fs from 'fs-extra';

import { createFilesystemSource } from '.';

import { MOCK_RESOURCES_ROOT, mockResourcesPath } from './testUtils';

describe('FilesystemSource should be failed to initialize', () => {
  it('when root directory is not exist', () => {
    function init() {
      createFilesystemSource({ root: './not-existing/directory ' });
    }

    expect(() => init()).toThrowError(/Unable to initialize FilesystemSource/);
  });
});

describe('FilesystemSource should get a resource', () => {
  it('in root directory', async () => {
    const fs = createFilesystemSource({ root: path.resolve(MOCK_RESOURCES_ROOT, 'res-1') });
    const resource = await Promise.all([fs.get('1'), fs.get('2'), fs.get('non-existing')]);

    expect(resource[0]).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "entity": "res-1 data",
          "id": "1",
        },
        "kind": "Success",
      }
    `);
    expect(resource[1]).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "entity": "",
          "id": "2",
        },
        "kind": "Success",
      }
    `);

    expect(resource[2].kind === 'Error' && resource[2].error).toMatch(/is not exist/);
  });

  it('with sub directories', async () => {
    const fs = createFilesystemSource({ root: MOCK_RESOURCES_ROOT });
    const resource = await Promise.all([fs.get('res-1/1'), fs.get('res-2/a'), fs.get('non-existing')]);

    expect(resource[0]).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "entity": "res-1 data",
          "id": "res-1/1",
        },
        "kind": "Success",
      }
    `);
    expect(resource[1]).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "entity": "",
          "id": "res-2/a",
        },
        "kind": "Success",
      }
    `);

    expect(resource[2].kind === 'Error' && resource[2].error).toMatch(/is not exist/);
  });
});

it('with custom id to path transform', async () => {
  const fs = createFilesystemSource({
    root: MOCK_RESOURCES_ROOT,
    idToPath(id, pathDelimeter) {
      return path.resolve(MOCK_RESOURCES_ROOT, id.replace(/\|\|/, pathDelimeter));
    },
  });
  const resource = await Promise.all([fs.get('res-1||1')]);

  expect(resource[0]).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "entity": "res-1 data",
        "id": "res-1||1",
      },
      "kind": "Success",
    }
  `);
});

describe('FilesystemSource should get list of resources', () => {
  it('in root directory', async () => {
    const fs = createFilesystemSource({ root: path.resolve(MOCK_RESOURCES_ROOT, 'res-1') });
    const resources = await fs.query({});

    expect(resources).toMatchInlineSnapshot(`
      Object {
        "data": Array [
          Object {
            "entity": "res-1 data",
            "id": "1",
          },
          Object {
            "entity": "",
            "id": "2",
          },
          Object {
            "entity": "",
            "id": "3",
          },
        ],
        "kind": "Success",
        "next": null,
        "prev": null,
      }
    `);
  });

  it('with sub directories', async () => {
    const fs = createFilesystemSource({ root: MOCK_RESOURCES_ROOT });
    const resources = await fs.query({});

    expect(resources).toMatchInlineSnapshot(`
      Object {
        "data": Array [
          Object {
            "entity": "",
            "id": "empty/.gitkeep",
          },
          Object {
            "entity": "res-1 data",
            "id": "res-1/1",
          },
          Object {
            "entity": "",
            "id": "res-1/2",
          },
          Object {
            "entity": "",
            "id": "res-1/3",
          },
          Object {
            "entity": "",
            "id": "res-2/a",
          },
          Object {
            "entity": "",
            "id": "res-2/b",
          },
          Object {
            "entity": "",
            "id": "res-2/c",
          },
        ],
        "kind": "Success",
        "next": null,
        "prev": null,
      }
    `);
  });

  it('with exclude files pattern', async () => {
    const fs = createFilesystemSource({ root: MOCK_RESOURCES_ROOT, exclude: /res-1/ });

    const list = await fs.query({});

    expect(list).not.toMatchObject({
      data: expect.arrayContaining([
        expect.objectContaining({
          entity: expect.any(String),
          id: expect.stringMatching(/res-1/),
        }),
      ]),
    });

    expect(list).toMatchObject({
      data: expect.arrayContaining([
        expect.objectContaining({
          entity: expect.any(String),
          id: expect.stringMatching(/res-2/),
        }),
      ]),
    });
  });

  it('with custom path to id tranform', async () => {
    const fs = createFilesystemSource({
      root: MOCK_RESOURCES_ROOT,
      pathToId(path, delimeter) {
        return path.replace(delimeter, '||');
      },
      idToPath(id, pathDelimeter) {
        return path.resolve(MOCK_RESOURCES_ROOT, id.replace(/\|\|/, pathDelimeter));
      },
    });
    const resources = await fs.query({});

    expect(resources).toMatchObject({
      data: expect.arrayContaining([
        expect.objectContaining({
          entity: expect.any(String),
          id: expect.stringMatching(/\|\|/),
        }),
      ]),
    });
  });

  it('with exclude by RegExp', async done => {
    const fs = createFilesystemSource({ root: path.resolve(MOCK_RESOURCES_ROOT, 'empty'), exclude: /\.gitkeep/ });
    const result = await fs.query({});

    expect(result.kind === 'Success').toBe(true);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "data": Array [],
        "kind": "Success",
        "next": null,
        "prev": null,
      }
    `);

    done();
  });
});

it.skip('should set resource in existing directory & remove a resource', async () => {
  const fs = createFilesystemSource({ root: MOCK_RESOURCES_ROOT });
  const setResult = await fs.set('res-1__new__1', 'hello');

  expect(setResult).toMatchObject(
    expect.objectContaining({
      kind: 'Success',
      data: 'OK',
    })
  );

  const deleteResult = await fs.delete('res-1__new__1');
  expect(deleteResult).toMatchInlineSnapshot(`
    Object {
      "data": "OK",
      "kind": "Success",
    }
  `);

  expect(await fs.get('res-1__new__1')).toMatchObject(
    expect.objectContaining({
      kind: 'Error',
      error: expect.stringContaining('not exist'),
    })
  );
});

it.skip('should create directory for a resource', async () => {
  const fs = createFilesystemSource({ root: mockResourcesPath('create-resources-folder'), autoCreateRoot: true });
  const result = await fs.set('resource-1', 'hello');
  expect(result).toMatchObject(
    expect.objectContaining({
      kind: 'Success',
    })
  );
});

it.skip('should clear list of resources', async () => {
  const root = path.resolve(MOCK_RESOURCES_ROOT, 'to-remove');
  await fs.ensureDir(root);

  const source = createFilesystemSource({ root });

  await source.clear();
  const result = await source.query({});

  expect(result).toMatchObject({
    data: expect.arrayContaining([]),
  });
});
