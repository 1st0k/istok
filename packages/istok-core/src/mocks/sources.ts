import { makeResultError, UniformFiniteSource } from '../Source';
import { createMemorySource } from '../MemorySource';

export const INTENDED_ERROR = 'intended error' as const;
export type IntendedError = typeof INTENDED_ERROR;

export const errorSource: UniformFiniteSource<string> = {
  async get(id) {
    return makeResultError(`${INTENDED_ERROR} "get" with resource ${id}`);
  },
  async set(id, _) {
    return makeResultError(`${INTENDED_ERROR} "set" with resource ${id}`);
  },
  async getList() {
    return makeResultError(`${INTENDED_ERROR} "getMany"`);
  },
};

export const successSource: UniformFiniteSource<string, IntendedError> = createMemorySource({
  initialResources: {
    'a/1': 'test resource data',
  },
});
