module.exports = {
  verbose: true,
  setupFilesAfterEnv: ['./setupTests.ts'],
  transform: {
    '.(ts|tsx)$': require.resolve('ts-jest/dist'),
  },
};
