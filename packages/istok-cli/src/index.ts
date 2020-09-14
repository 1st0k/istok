import { square } from '@istok/core';

const input = parseInt(process.argv[2], 10);

export function main() {
  console.log(`${input} * ${input} = ${square(input)}`);
}
