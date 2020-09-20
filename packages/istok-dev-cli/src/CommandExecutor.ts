import { newModule } from './CommandNewModule';

const CREATE_NEW_MODULE = 'module:new' as const;
const COMMANDS = [CREATE_NEW_MODULE] as const;

type Command = typeof COMMANDS[number];

export function isCommand(candidate: unknown): candidate is Command {
  return COMMANDS.includes(candidate as Command);
}
export async function execute(command: Command, args: any[]) {
  switch (command) {
    case CREATE_NEW_MODULE: {
      const name = args[0];

      if (!name) {
        return {
          type: 'error',
          error: `Module's "name" argument  must be defined`,
        };
      }

      return newModule(name);
    }
  }
}
