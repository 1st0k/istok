const path = require('path');

const babelJestConfig = { configFile: path.resolve(__dirname, './.babelrc.test') };

module.exports = {
  transform: {
    '.(ts|tsx)$': require.resolve('ts-jest/dist'),
    '.(js|jsx)$': [require.resolve('babel-jest'), babelJestConfig],
  },
};
