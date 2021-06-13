import { createMemorySource } from '@istok/core';

const command = process.argv[2];
const values = process.argv[3] ?? 'null';

export function main() {
  switch (command) {
    case 'createMemorySource': {
      try {
        const source = createMemorySource({
          initialResources: JSON.parse(values),
        });
        source.query({}).then(result => {
          if (result.kind === 'Success') {
            process.stdout.write(JSON.stringify(result.data));
          }
        });
      } catch (e) {
        console.log('something went wrong:\n');
        console.log(e);
      }
    }
  }
}
