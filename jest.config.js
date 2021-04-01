module.exports = {
  setupFiles: ['dotenv/config'],
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: false,
      },
    },
  },
};
