import { createMemorySource } from './MemorySource';
import { isGetSetResultSuccess, isResultError } from './Source';
import { ERROR, SUCCESS } from './utils/Result';

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
