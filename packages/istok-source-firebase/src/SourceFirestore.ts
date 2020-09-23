import { UpdateData, DocumentData } from '@google-cloud/firestore';

import {
  makeGetListResultSuccees,
  makeGetSetResultSuccess,
  makeResultError,
  UniformFiniteSource,
  createIdPathAdapter,
} from '@istok/core';
import { FirebaseSourceOptons } from './SourceFirebase';

export type FirestoreSourceOptions = FirebaseSourceOptons;

export function createFirestoreSource<T>({
  firebase,
  options,
}: FirestoreSourceOptions): UniformFiniteSource<T, string> {
  const root = options.root.endsWith('/') ? options.root : `${options.root}/`;

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
        const doc = await firebase
          .firestore()
          .doc(resourcePath)
          .get();

        if (!doc.exists) {
          return makeResultError(`Resource "${id}" (path: "${resourcePath}") is not exist.`);
        }

        const data = doc.data() as T | undefined;

        if (!data) {
          return makeResultError(`Resource "${id}" (path: "${resourcePath}") has no data.`);
        }

        return makeGetSetResultSuccess(id, data);
      } catch (error) {
        return makeResultError(`Failed to get Resource with id "${id}", path: "${resourcePath}".`);
      }
    },
    async set(id, data) {
      const resourcePath = idToPath(id);

      try {
        const docRef = firebase.firestore().doc(resourcePath);
        const docData = await docRef.get();
        if (docData.exists) {
          await docRef.update(data as UpdateData);
        } else {
          await docRef.create(data as DocumentData);
        }
        return makeGetSetResultSuccess(id, data);
      } catch (e) {
        return makeResultError(`Failed to set Resource with id "${id}", path: "${resourcePath}: ${e.toString()}".`);
      }
    },
    async getList() {
      const listRoot = root.slice(0, -1);
      try {
        const collectionRef = firebase.firestore().collection(listRoot);
        const docs = await collectionRef.listDocuments();

        return makeGetListResultSuccees(docs.map(({ id }) => ({ id: pathToId(id) })));
      } catch (e) {
        return makeResultError(`Failed to get list of resources: ${e.toString()}`);
      }
    },
  };
}
