import path from 'path';
import fs from 'fs-extra';

import { isGetListResultSuccess, isGetSetResultSuccess, ResourceOpResultError } from '@istok/core';

import { createFilesystemSource } from '.';
import { SUCCESS } from '@istok/utils';

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

  it('with exclude files pattern', async done => {
    const fs = createFilesystemSource({ root: MOCK_RESOURCES_ROOT, exclude: /res-1/ });

    const list = await fs.getList();

    expect(list).not.toMatchObject({
      resources: expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(/res-1/),
        }),
      ]),
    });

    expect(list).toMatchObject({
      resources: expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(/res-2/),
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

  it('with exclude by RegExp', async done => {
    const fs = createFilesystemSource({ root: path.resolve(MOCK_RESOURCES_ROOT, 'empty'), exclude: /\.gitkeep/ });
    const result = await fs.getList();

    expect(isGetListResultSuccess(result)).toBe(true);

    expect((result as any).resources).toBeInstanceOf(Array);
    expect((result as any).resources.length).toBe(0);

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

it('should create directory for a resource', async done => {
  const fs = createFilesystemSource({ root: mockResourcesPath('create-resources-folder'), autoCreateRoot: true });
  const result = await fs.set('resource-1', 'hello');
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

it.skip('should clear list of resources', async done => {
  const root = path.resolve(MOCK_RESOURCES_ROOT, 'to-remove');
  await fs.ensureDir(root);

  const source = createFilesystemSource({ root });

  await source.clear();
  const result = await source.getList();

  expect(result).toMatchObject({
    resources: expect.arrayContaining([]),
  });

  done();
});
