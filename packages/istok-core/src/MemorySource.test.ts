import { ERROR, SUCCESS } from '@istok/utils';

import { createMemorySource } from './MemorySource';
import { isGetListResultSuccess, isGetSetResultSuccess, isResultError } from './Source';

describe('MemorySource should get Resource', () => {
  it('if it was added initially', async done => {
    const source = createMemorySource({
      initialResources: {
        resource: 'resource-value',
      },
    });

    const resource = await source.get('resource');

    expect(resource.type).toEqual(SUCCESS);
    if (isGetSetResultSuccess(resource)) {
      expect(resource.resource.data).toBe('resource-value');
    }

    done();
  });

  it('if it was added later', async done => {
    const source = createMemorySource<string, string>();

    const notExistingResource = await source.get('resource');
    expect(notExistingResource.type).toEqual(ERROR);
    if (isResultError(notExistingResource)) {
      expect(notExistingResource.error).toMatchInlineSnapshot(`"RESOURCE_NOT_EXISTS"`);
    }

    await source.set('resource', 'resource-value');

    const resource = await source.get('resource');
    expect(resource.type).toEqual(SUCCESS);
    if (isGetSetResultSuccess(resource)) {
      expect(resource.resource.data).toBe('resource-value');
    }

    done();
  });
});

describe('MemorySource should get Resources list', () => {
  it('empty initial list', async done => {
    const source = createMemorySource();

    const list = await source.getList();

    expect(isGetListResultSuccess(list)).toBe(true);

    if (isGetListResultSuccess(list)) {
      expect(list.resources).toBeInstanceOf(Array);
      expect(list.resources.length).toBe(0);
    }

    done();
  });

  it('initial list', async done => {
    const source = createMemorySource({
      initialResources: {
        a: 'resource-a',
        b: 'resource-b',
      },
    });

    const list = await source.getList();

    expect(isGetListResultSuccess(list)).toBe(true);

    if (isGetListResultSuccess(list)) {
      expect(list.resources).toBeInstanceOf(Array);
      expect(list.resources.length).toBe(2);
      expect(list.resources).toEqual(expect.arrayContaining([{ id: 'a' }, { id: 'b' }]));
    }

    done();
  });

  it('after items were added', async done => {
    const source = createMemorySource({
      initialResources: {
        a: 'resource-a',
      },
    });

    await source.set('b', 'resource-b');

    const list = await source.getList();

    expect(isGetListResultSuccess(list)).toBe(true);

    if (isGetListResultSuccess(list)) {
      expect(list.resources).toBeInstanceOf(Array);
      expect(list.resources.length).toBe(2);
      expect(list.resources).toEqual(expect.arrayContaining([{ id: 'a' }, { id: 'b' }]));
    }

    done();
  });
});
