#!/usr/bin/env node

const program = require('./dist/index.js');

async function start() {
  process.stdout.write(JSON.stringify(await program.main()));
}

start();
