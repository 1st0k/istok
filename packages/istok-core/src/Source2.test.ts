import { success, successExt } from './Result';
import { Source } from './Source2';

it('should be typed', async () => {
  const s: Source<string> = {
    async clear() {
      return success('OK');
    },
    async delete(id) {
      return success('OK');
    },
    async get(id) {
      return success('hey' + id);
    },
    async set(id, entity) {
      return success('OK');
    },
    async query(params) {
      return successExt([], {
        next: null,
        prev: null,
      });
    },
  };

  const result = await s.query({
    limit: 20,
    offset: 0,
  });

  if (result.kind === 'Success') {
    expect(result.data).toMatchInlineSnapshot();
  } else {
    throw new Error('oops');
  }
});
