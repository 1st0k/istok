import { startService } from './service';

it.skip('should get credentials', async done => {
  const service = startService({
    envFilePath: '.env',
    debug: true,
  });

  const result = await service.firestore().doc('test/doc').get();

  expect(result.data()).toBeTruthy();

  done();
});
