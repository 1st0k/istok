const path = require('path');
const esModules = ['unist-util-'].join('|');

const babelJestConfig = { cwd: __dirname, configFile: path.resolve(__dirname, './.babelrc') };

module.exports = {
  rootDir: './',
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  transform: {
    '.(js|jsx|ts|tsx)$': [require.resolve('babel-jest'), babelJestConfig], //require.resolve('ts-jest/dist'),
  },
  transformIgnorePatterns: [
    `/node_modules/(?!${esModules})`,
    `../../node_modules/(?!${esModules})`,
    '\\.pnp\\.[^\\/]+$',
  ],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
};
