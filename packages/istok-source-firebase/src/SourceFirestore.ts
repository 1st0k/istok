import { UpdateData, DocumentData } from '@google-cloud/firestore';

import { Firebase } from './service';

import { makeGetListResultSuccees, makeGetSetResultSuccess, makeResultError, UniformFiniteSource } from '@istok/core';

export type FirestoreSourceOptions = {
  firebase: Firebase;
  options: {
    root: string;
    pathToId?(path: string, pathDelimeterRegExp: RegExp): string;
    idToPath?(id: string, pathDelimeter: string): string;
  };
};

export function createFirestoreSource<T, E extends string>({
  firebase,
  options,
}: FirestoreSourceOptions): UniformFiniteSource<T, E> {
  const root = options.root.endsWith('/') ? options.root : `${options.root}/`;

  const DEFAULT_PATH_DELIMETER = '__';
  const DEFAULT_ID_DELIMETER = '/';
  const pathDelimeterRegExp = new RegExp(`${DEFAULT_PATH_DELIMETER}`, 'g');
  const idDelimeterRegExp = new RegExp(`${DEFAULT_ID_DELIMETER}`, 'g');

  const pathToId =
    options.pathToId ??
    function defaultPathToId(path: string, pathDelimeterRegExp: RegExp) {
      return path.replace(pathDelimeterRegExp, DEFAULT_ID_DELIMETER);
    };

  const idToPath =
    options.idToPath ??
    function(id: string, pathDelimeter = DEFAULT_PATH_DELIMETER) {
      return root + id.replace(idDelimeterRegExp, pathDelimeter);
    };

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
      const resourcePath = idToPath(id, DEFAULT_PATH_DELIMETER);
      try {
        const doc = await firebase
          .firestore()
          .doc(resourcePath)
          .get();

        if (!doc.exists) {
          return makeResultError(`Resource "${id}" (path: "${resourcePath}") is not exist.` as E);
        }

        const data = doc.data() as T | undefined;

        if (!data) {
          return makeResultError(`Resource "${id}" (path: "${resourcePath}") has no data.` as E);
        }

        return makeGetSetResultSuccess(id, data);
      } catch (error) {
        return makeResultError(`Failed to get Resource with id "${id}", path: "${resourcePath}".` as E);
      }
    },
    async set(id, data) {
      const resourcePath = idToPath(id, DEFAULT_PATH_DELIMETER);

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
        return makeResultError(
          `Failed to set Resource with id "${id}", path: "${resourcePath}: ${e.toString()}".` as E
        );
      }
    },
    async getList() {
      const listRoot = root.slice(0, -1);
      try {
        const collectionRef = firebase.firestore().collection(listRoot);
        const docs = await collectionRef.listDocuments();

        return makeGetListResultSuccees(docs.map(({ id }) => ({ id: pathToId(id, pathDelimeterRegExp) })));
      } catch (e) {
        return makeResultError(`Failed to get list of resources: ${e.toString()}` as E);
      }
    },
  };
}
