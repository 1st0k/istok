import { createMemorySource } from './MemorySource';

it('should be gucci', async () => {
  const s = createMemorySource({
    initialResources: {
      kek: 'KEKW',
      lol: 'LOLW',
    },
  });

  expect(await s.query({ limit: 0, offset: 0 })).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        Object {
          "entity": "KEKW",
          "id": "kek",
        },
        Object {
          "entity": "LOLW",
          "id": "lol",
        },
      ],
      "kind": "Success",
      "next": null,
      "prev": null,
      "total": 2,
    }
  `);

  expect(await s.ids({ limit: 0, offset: 0 })).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        "kek",
        "lol",
      ],
      "kind": "Success",
      "next": null,
      "prev": null,
      "total": 2,
    }
  `);
});
