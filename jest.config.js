const path = require('path');

const esModules = ['unist-util-'].join('|');
const babelJestConfig = { cwd: __dirname, configFile: path.resolve(__dirname, './.test.babelrc') };

module.exports = {
  projects: ['<rootDir>/packages/istok-mdx-compile/jest.config.js'],
  setupFiles: ['dotenv/config'],
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: false,
      },
    },
  },
  transform: {
    '.(js|jsx|ts|tsx)$': [require.resolve('babel-jest'), babelJestConfig],
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`, '\\.pnp\\.[^\\/]+$'],
};
