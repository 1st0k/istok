import { startService } from './service';

it.skip('should get credentials', async () => {
  const { app } = startService({
    envFilePath: '.env',
    debug: true,
  });

  const result = await app
    .firestore()
    .doc('test/doc')
    .get();

  expect(result.data()).toBeTruthy();
});
