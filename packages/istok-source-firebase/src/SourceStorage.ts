import { File } from '@google-cloud/storage';
import { v4 } from 'uuid';
import { createIdPathAdapter, identityTransforms, Source, error, entityResponse, success } from '@istok/core';

import { FirebaseSourceOptons } from './SourceFirebase';
import { startService } from './service';

export type FirebaseStorageSourceOptions = FirebaseSourceOptons<
  string,
  {
    bucket: string;
    isPublic?: boolean;
    debug?: boolean;
    entityPathFilter?: RegExp | string;
    noValidate?: boolean;
  },
  string
>;

function readFile(file: File, noValidate = false): Promise<string> {
  const dataBuffer: Buffer[] = [];

  return new Promise((resolve, reject) => {
    file
      .createReadStream({ validation: !noValidate })
      .on('data', chunk => {
        dataBuffer.push(chunk);
      })
      .on('end', () => {
        const result = Buffer.concat(dataBuffer).toString();
        resolve(result);
      })
      .on('error', err => reject(err));
  });
}

export function createFirebaseStorageSource({
  firebase = startService(),
  options,
}: FirebaseStorageSourceOptions): Source<string> {
  // root with trailing slash
  const rootNormalized = options.root.endsWith('/') ? options.root : options.root + '/';
  const { readTransform = identityTransforms.read, writeTransform = identityTransforms.write } = options;

  const { pathToId, idToPath } = createIdPathAdapter({
    idDelimeter: '/',
    pathDelimeter: '/',
    pathToId:
      options.pathToId ??
      function defaultPathToId(path: string, pathDelimeterRegExp: RegExp) {
        return path.replace(pathDelimeterRegExp, '/');
      },

    idToPath:
      options.idToPath ??
      function(id: string, pathDelimeter, idDelimeterRegExp) {
        return rootNormalized + id.replace(idDelimeterRegExp, pathDelimeter);
      },
  });

  const bucket = firebase.app.storage().bucket(options.bucket);

  const rootRegExp = new RegExp(`^${rootNormalized}`);
  const filenameFilter =
    options.entityPathFilter instanceof RegExp
      ? options.entityPathFilter
      : new RegExp(`${options.entityPathFilter ?? '.*(?<!/)'}$`);

  return {
    async get(id) {
      const resourcePath = idToPath(id);

      try {
        const content = await readFile(bucket.file(resourcePath), options.noValidate);
        console.log('read', content);
        return entityResponse(id, readTransform(content));
      } catch (e) {
        return error(e.toString());
      }
    },
    set(id, data) {
      const resourcePath = idToPath(id);
      const setOptions = options.isPublic
        ? ({
            metadata: {
              metadata: {
                firebaseStorageDownloadTokens: v4(),
              },
            },
            predefinedAcl: 'publicRead',
          } as const)
        : {};

      return new Promise(resolve => {
        bucket.file(resourcePath).save(writeTransform(data), setOptions, err => {
          if (err) {
            return resolve(error(err.toString()));
          }
          return resolve(success('OK'));
        });
      });
    },
    // TODO: filter
    async ids({ limit = 0, offset = 0 }) {
      try {
        const [files] = await bucket.getFiles({
          prefix: rootNormalized,
        });

        const entityFiles = files.filter(({ name }) => filenameFilter.test(name));

        let queriedFilenames: string[] = [];
        let selected = 0;
        const maxIndex = limit ? Math.min(offset + limit, entityFiles.length) : entityFiles.length;
        for (let i = offset; i < maxIndex; i++) {
          queriedFilenames[selected] = entityFiles[i].name;
          selected++;
        }

        const ids = queriedFilenames.map(f => pathToId(f.replace(rootRegExp, '')));

        return {
          kind: 'Success',
          data: ids,
          next: null,
          prev: null,
          total: entityFiles.length,
        };
      } catch (e) {
        return error(`Failed to get Ids of entities: ${e.toString()}`);
      }
    },
    // TODO: filter
    async query({ limit = 0, offset = 0 }) {
      try {
        const [files] = await bucket.getFiles({
          prefix: rootNormalized,
        });

        const entityFiles = files.filter(({ name }) => filenameFilter.test(name));

        let queriedFiles: File[] = [];
        let selected = 0;
        const maxIndex = limit ? Math.min(offset + limit, entityFiles.length) : entityFiles.length;
        for (let i = offset; i < maxIndex; i++) {
          queriedFiles[selected] = entityFiles[i];
          selected++;
        }

        const contents = await Promise.all(queriedFiles.map(file => readFile(file, options.noValidate)));
        const ids = queriedFiles.map(({ name }) => pathToId(name.replace(rootRegExp, '')));

        if (contents.length !== ids.length) {
          return error(`Failed to query entities: mismatch count of files and ids ${contents.length}/${ids.length}}.`);
        }

        const data = ids.map((id, index) => ({
          id,
          entity: contents[index],
        }));

        return {
          kind: 'Success',
          data,
          next: null,
          prev: null,
          total: entityFiles.length,
        };
      } catch (e) {
        return error(`Failed to get Ids of entities: ${e.toString()}`);
      }
    },
    async delete(id) {
      const resourcePath = idToPath(id);
      try {
        bucket.file(resourcePath).delete();
        return success('OK');
      } catch (e) {
        return error(`Failed to delete resource with id "${id}" by path "${resourcePath}": ${e.toString()}.`);
      }
    },
    async clear() {
      try {
        await bucket.deleteFiles({
          prefix: `${rootNormalized}`,
        });

        return success('OK');
      } catch (e) {
        return error(`Failed to clear resources at "${rootNormalized}": ${e.toString()}`);
      }
    },
  };
}
