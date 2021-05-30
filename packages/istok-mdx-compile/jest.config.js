const path = require('path');

const babelJestConfig = { configFile: path.resolve(__dirname, './.babelrc') };

const esModules = ['unist-util-'].join('|');

module.exports = {
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  transform: {
    '.(js|jsx|ts|tsx)$': [require.resolve('babel-jest'), babelJestConfig], //require.resolve('ts-jest/dist'),
    '.(js|jsx)$': [require.resolve('babel-jest'), babelJestConfig],
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`, '\\.pnp\\.[^\\/]+$'],
};
