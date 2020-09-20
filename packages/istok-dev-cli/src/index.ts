import { execute, isCommand } from './CommandExecutor';

const command = process.argv[2];
const commandArgs = process.argv.slice(3);

export async function main() {
  if (isCommand(command)) {
    return execute(command, commandArgs);
  } else {
    return {
      type: 'error',
      error: 'unknown command',
    };
  }
}
