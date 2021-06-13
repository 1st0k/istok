import { Source } from '../Source';
import { createMemorySource } from '../MemorySource';
import { error } from '../Result';

export const INTENDED_ERROR = 'intended error' as const;
export type IntendedError = typeof INTENDED_ERROR;

export const errorSource: Source<string> = {
  async get(id) {
    return error(`${INTENDED_ERROR} "get" with resource ${id}`);
  },
  async set(id, _) {
    return error(`${INTENDED_ERROR} "set" with resource ${id}`);
  },
  async query() {
    return error(`${INTENDED_ERROR} "query"`);
  },
  async ids() {
    return error(`${INTENDED_ERROR} "ids"`);
  },
  async clear() {
    return error(`${INTENDED_ERROR} "clear"`);
  },
  async delete(id) {
    return error(`${INTENDED_ERROR} "delete" resource ${id}`);
  },
};

export const successSource: Source<string> = createMemorySource({
  initialResources: {
    'a/1': 'test resource data',
  },
});
