import { createMemorySource, isGetListResultSuccess } from '@istok/core';

const command = process.argv[2];
const values = process.argv[3] ?? 'null';

export function main() {
  switch (command) {
    case 'createMemorySource': {
      try {
        const source = createMemorySource({
          initialResources: JSON.parse(values),
        });
        source.getList().then(result => {
          if (isGetListResultSuccess(result)) {
            process.stdout.write(JSON.stringify(result.resources));
          }
        });
      } catch (e) {
        console.log('something went wrong:\n');
        console.log(e);
      }
    }
  }
}
