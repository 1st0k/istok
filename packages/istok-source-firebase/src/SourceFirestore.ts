import { UpdateData, DocumentData } from '@google-cloud/firestore';

import { Source, createIdPathAdapter, identityTransforms, error, entityResponse, success, Entity } from '@istok/core';
import { startService } from './service';
import { FirebaseSourceOptons } from './SourceFirebase';

export type FirestoreSourceOptions<T> = FirebaseSourceOptons<T>;

export function createFirestoreSource<T>({ firebase = startService(), options }: FirestoreSourceOptions<T>): Source<T> {
  const { app } = firebase;
  const root = options.root.endsWith('/') ? options.root : `${options.root}/`;

  const { readTransform = identityTransforms.read, writeTransform = identityTransforms.write } = options;

  const { pathToId, idToPath } = createIdPathAdapter({
    idDelimeter: '/',
    pathDelimeter: '__',
    pathToId:
      options.pathToId ??
      function defaultPathToId(path: string, pathDelimeterRegExp: RegExp) {
        return path.replace(pathDelimeterRegExp, '/');
      },

    idToPath:
      options.idToPath ??
      function(id: string, pathDelimeter, idDelimeterRegExp) {
        return root + id.replace(idDelimeterRegExp, pathDelimeter);
      },
  });

  // const listenResource: ListenResource<unknown, T> = <D>(location: T, listener: Listener<D>) => {
  //   return firebase
  //     .firestore()
  //     .doc(idToPath(location))
  //     .onSnapshot(snap => {
  //       if (snap.exists) {
  //         const data = snap.data();
  //         if (data) {
  //           listener(prepareResource(data as D, 'Source'));
  //         }
  //       }
  //     });
  // };

  return {
    async get(id) {
      const resourcePath = idToPath(id);
      try {
        const doc = await app
          .firestore()
          .doc(resourcePath)
          .get();

        if (!doc.exists) {
          return error(`Resource "${id}" (path: "${resourcePath}") is not exist.`);
        }

        const data = doc.data() as T | undefined;

        if (!data) {
          return error(`Resource "${id}" (path: "${resourcePath}") has no data.`);
        }

        return entityResponse(id, readTransform(data));
      } catch (e) {
        return error(`Failed to get Resource with id "${id}", path: "${resourcePath}".`);
      }
    },
    async set(id, data) {
      const resourcePath = idToPath(id);

      try {
        const docRef = app.firestore().doc(resourcePath);
        const docData = await docRef.get();
        const transformedData = writeTransform(data);
        if (docData.exists) {
          await docRef.update(transformedData as UpdateData);
        } else {
          await docRef.create(transformedData as DocumentData);
        }
        return success('OK');
      } catch (e) {
        return error(`Failed to set Resource with id "${id}", path: "${resourcePath}: ${e.toString()}".`);
      }
    },
    // TODO: filter
    async query({ limit = 0, offset = 0 }) {
      const listRoot = root.slice(0, -1);
      try {
        let collectionRef = app
          .firestore()
          .collection(listRoot)
          .limit(limit)
          .offset(offset);

        const docs = await collectionRef.get();

        let result: Entity<T>[] = [];

        docs.forEach(doc => {
          if (doc.exists) {
            const data = doc.data();

            if (data) {
              result.push({ entity: readTransform(data), id: pathToId(doc.id) });
            }
          }
        });

        return {
          kind: 'Success',
          data: result,
          next: null,
          prev: null,
        };
      } catch (e) {
        return error(`Failed to query entities: ${e.toString()}`);
      }
    },
    // TODO: filter
    async ids({ limit = 0, offset = 0 }) {
      const listRoot = root.slice(0, -1);
      try {
        let collectionRef = app
          .firestore()
          .collection(listRoot)
          .limit(limit)
          .offset(offset);

        const docs = await collectionRef.get();

        let result: string[] = [];

        docs.forEach(doc => {
          if (doc.exists) {
            const data = doc.data();

            if (data) {
              result.push(pathToId(doc.id));
            }
          }
        });

        return {
          kind: 'Success',
          data: result,
          next: null,
          prev: null,
        };
      } catch (e) {
        return error(`Failed to query ids of entities: ${e.toString()}`);
      }
    },
    async delete(id) {
      const resourcePath = idToPath(id);
      try {
        const docRef = app.firestore().doc(resourcePath);
        await docRef.delete();
        return success('OK');
      } catch (e) {
        return error(`Failed to delete resource with id "${id}" by path "${resourcePath}": ${e.toString()}.`);
      }
    },
    async clear() {
      const listRoot = root.slice(0, -1);
      try {
        const docs = await app
          .firestore()
          .collection(listRoot)
          .listDocuments();

        await Promise.all(docs.map(doc => doc.delete()));
        return success('OK');
      } catch (e) {
        return error(`Failed to clear resources: ${e.toString()}`);
      }
    },
  };
}
