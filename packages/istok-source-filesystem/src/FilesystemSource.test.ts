import path from 'path';

import { createFilesystemSource } from '.';

const MOCK_RESOURCES_ROOT = path.resolve(__dirname, '../mocks/resources');

describe('FilesystemSource should be failed to initialize', () => {
  it('when root directory is not exist', () => {
    function init() {
      createFilesystemSource({ root: './not-existing/directory ' });
    }

    expect(() => init()).toThrowError(/Unable to initialize FilesystemSource/);
  });
});

describe('FilesystemSource should get a resource', () => {
  it('in root directory', async done => {
    const fs = createFilesystemSource({ root: path.resolve(MOCK_RESOURCES_ROOT, 'res-1') });
    const resource = await Promise.all([fs.get('1'), fs.get('2'), fs.get('non-existing')]);
    expect(resource).toMatchInlineSnapshot(`
      Array [
        Object {
          "resource": Object {
            "data": "",
            "id": "1",
          },
          "type": "success",
        },
        Object {
          "resource": Object {
            "data": "",
            "id": "2",
          },
          "type": "success",
        },
        Object {
          "error": "Resource \\"non-existing\\" (path: \\"C:\\\\projects\\\\dev\\\\1st0k\\\\packages\\\\istok-source-filesystem\\\\mocks\\\\resources\\\\res-1\\\\non-existing\\") is not exist.",
          "type": "error",
        },
      ]
    `);
    done();
  });

  it('with sub directories', async done => {
    const fs = createFilesystemSource({ root: MOCK_RESOURCES_ROOT });
    const resource = await Promise.all([fs.get('res-1__1'), fs.get('res-2__a'), fs.get('non-existing')]);
    expect(resource).toMatchInlineSnapshot(`
      Array [
        Object {
          "resource": Object {
            "data": "",
            "id": "res-1__1",
          },
          "type": "success",
        },
        Object {
          "resource": Object {
            "data": "",
            "id": "res-2__a",
          },
          "type": "success",
        },
        Object {
          "error": "Resource \\"non-existing\\" (path: \\"C:\\\\projects\\\\dev\\\\1st0k\\\\packages\\\\istok-source-filesystem\\\\mocks\\\\resources\\\\non-existing\\") is not exist.",
          "type": "error",
        },
      ]
    `);
    done();
  });
});

it('with custom id to path transform', async done => {
  const fs = createFilesystemSource({
    root: MOCK_RESOURCES_ROOT,
    idToPath(id, delimeter) {
      return path.resolve(MOCK_RESOURCES_ROOT, id.replace(/\|\|/, delimeter));
    },
  });
  const resource = await Promise.all([fs.get('res-1||1')]);
  expect(resource).toMatchInlineSnapshot(`
    Array [
      Object {
        "resource": Object {
          "data": "",
          "id": "res-1||1",
        },
        "type": "success",
      },
    ]
  `);
  done();
});

describe('FilesystemSource should get list of resources', () => {
  it('in root directory', async done => {
    const fs = createFilesystemSource({ root: path.resolve(MOCK_RESOURCES_ROOT, 'res-1') });
    const resources = await fs.getList();
    expect(resources).toMatchInlineSnapshot(`
      Object {
        "resources": Array [
          Object {
            "id": "1",
          },
          Object {
            "id": "2",
          },
          Object {
            "id": "3",
          },
        ],
        "type": "success",
      }
    `);
    done();
  });

  it('with sub directories', async done => {
    const fs = createFilesystemSource({ root: MOCK_RESOURCES_ROOT });
    const resources = await fs.getList();
    expect(resources).toMatchInlineSnapshot(`
      Object {
        "resources": Array [
          Object {
            "id": "res-1__1",
          },
          Object {
            "id": "res-1__2",
          },
          Object {
            "id": "res-1__3",
          },
          Object {
            "id": "res-2__a",
          },
          Object {
            "id": "res-2__b",
          },
          Object {
            "id": "res-2__c",
          },
        ],
        "type": "success",
      }
    `);
    done();
  });

  it('with custom path to id tranform', async done => {
    const fs = createFilesystemSource({
      root: MOCK_RESOURCES_ROOT,
      pathToId(path, delimeter) {
        return path.replace(delimeter, '||');
      },
    });
    const resources = await fs.getList();
    expect(resources).toMatchInlineSnapshot(`
      Object {
        "resources": Array [
          Object {
            "id": "res-1||1",
          },
          Object {
            "id": "res-1||2",
          },
          Object {
            "id": "res-1||3",
          },
          Object {
            "id": "res-2||a",
          },
          Object {
            "id": "res-2||b",
          },
          Object {
            "id": "res-2||c",
          },
        ],
        "type": "success",
      }
    `);
    done();
  });
});

it.skip('should set resource in existing directory', async done => {
  const fs = createFilesystemSource({ root: MOCK_RESOURCES_ROOT });
  const result = await fs.set('res-1__new', 'hello');
  expect(result).toMatchInlineSnapshot(`
    Object {
      "resource": Object {
        "data": "hello",
        "id": "res-1__new",
      },
      "type": "success",
    }
  `);
  done();
});

it.skip('should create directory for a resource', async done => {
  const fs = createFilesystemSource({ root: MOCK_RESOURCES_ROOT });
  const result = await fs.set('new__resources__directory__resource-1', 'hello');
  expect(result).toMatchInlineSnapshot(`
    Object {
      "resource": Object {
        "data": "hello",
        "id": "new__resources__directory__resource-1",
      },
      "type": "success",
    }
  `);
  done();
});
