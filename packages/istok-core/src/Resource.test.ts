import { makeResource } from './Resource';

describe('Resource should be typed', () => {
  it('"id" field is a string', () => {
    const resource = makeResource('a/1', undefined);
    expect(resource.id).toMatch('a/1');
  });

  it('"data" field is a generic', () => {
    const resource = makeResource('a/1', { value: 420 });
    expect(resource.data.value).toBe(420);
  });
});
