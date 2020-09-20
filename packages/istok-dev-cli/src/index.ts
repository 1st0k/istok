import { execute, isCommand } from './CommandExecutor';

const [command, ...args] = process.argv.slice(2);

export async function main() {
  if (isCommand(command)) {
    return execute(command, args);
  } else {
    return {
      type: 'error',
      error: 'unknown command',
    };
  }
}
