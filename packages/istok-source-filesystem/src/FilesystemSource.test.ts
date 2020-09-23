import path from 'path';

import { isGetSetResultSuccess, ResourceOpResultError } from '@istok/core';

import { createFilesystemSource } from '.';
import { SUCCESS } from '@istok/utils';

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

    expect(isGetSetResultSuccess(resource[0])).toBe(true);
    expect(isGetSetResultSuccess(resource[1])).toBe(true);
    expect(isGetSetResultSuccess(resource[2])).toBe(false);

    expect((resource[2] as ResourceOpResultError<string>).error).toMatch(/is not exist/);

    done();
  });

  it('with sub directories', async done => {
    const fs = createFilesystemSource({ root: MOCK_RESOURCES_ROOT });
    const resource = await Promise.all([fs.get('res-1/1'), fs.get('res-2/a'), fs.get('non-existing')]);

    expect(isGetSetResultSuccess(resource[0])).toBe(true);
    expect(isGetSetResultSuccess(resource[1])).toBe(true);
    expect(isGetSetResultSuccess(resource[2])).toBe(false);

    expect((resource[2] as ResourceOpResultError<string>).error).toMatch(/is not exist/);

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

  expect(isGetSetResultSuccess(resource[0])).toBe(true);
  if (isGetSetResultSuccess(resource[0])) {
    expect(resource[0].resource).toMatchObject({
      id: expect.stringMatching(/\|\|/),
      data: expect.any(String),
    });
  }
  done();
});

describe('FilesystemSource should get list of resources', () => {
  it('in root directory', async done => {
    const fs = createFilesystemSource({ root: path.resolve(MOCK_RESOURCES_ROOT, 'res-1') });
    const resources = await fs.getList();

    expect(resources).toMatchObject({
      resources: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
        }),
      ]),
    });

    done();
  });

  it('with sub directories', async done => {
    const fs = createFilesystemSource({ root: MOCK_RESOURCES_ROOT });
    const resources = await fs.getList();

    expect(resources).toMatchObject({
      resources: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
        }),
      ]),
    });

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

    expect(resources).toMatchObject({
      resources: expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(/\|\|/),
        }),
      ]),
    });

    done();
  });

  it('in empty directory', async done => {
    const fs = createFilesystemSource({ root: path.resolve(MOCK_RESOURCES_ROOT, 'empty') });
    const resources = await fs.getList();

    expect(resources).toMatchObject({
      resources: expect.arrayContaining([]),
    });

    done();
  });
});

it.skip('should set resource in existing directory', async done => {
  const fs = createFilesystemSource({ root: MOCK_RESOURCES_ROOT });
  const result = await fs.set('res-1__new', 'hello');
  expect(result).toMatchObject(
    expect.objectContaining({
      kind: SUCCESS,
      resource: expect.objectContaining({
        data: expect.any(String),
        id: expect.any(String),
      }),
    })
  );
  done();
});

it.skip('should create directory for a resource', async done => {
  const fs = createFilesystemSource({ root: MOCK_RESOURCES_ROOT });
  const result = await fs.set('new__resources__directory__resource-1', 'hello');
  expect(result).toMatchObject(
    expect.objectContaining({
      kind: SUCCESS,
      resource: expect.objectContaining({
        data: expect.any(String),
        id: expect.any(String),
      }),
    })
  );

  done();
});
