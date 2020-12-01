import { v4 } from 'uuid';
import {
  createIdPathAdapter,
  identityTransforms,
  makeGetListResultSuccees,
  makeGetSetResultSuccess,
  Source,
} from '@istok/core';
import { makeResultError } from '@istok/utils';

import { FirebaseSourceOptons } from './SourceFirebase';
import { startService } from './service';

export type FirebaseStorageSourceOptions<T> = FirebaseSourceOptons<
  T,
  {
    bucket: string;
    isPublic?: boolean;
    debug?: boolean;
    filter?: RegExp | string;
  }
>;

export function createFirebaseStorageSource<T = unknown>({
  firebase = startService(),
  options,
}: FirebaseStorageSourceOptions<T>): Source<T, string> {
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

  const bucket = firebase.storage().bucket(options.bucket);

  return {
    get(id) {
      const resourcePath = idToPath(id);
      return new Promise(resolve => {
        const data: Buffer[] = [];

        try {
          /* const fileStream =  */ bucket
            .file(resourcePath)
            .createReadStream()
            .on('data', chunk => {
              data.push(chunk);
            })
            .on('end', () => {
              const result = Buffer.concat(data).toString();
              resolve(makeGetSetResultSuccess(id, readTransform(result)));
            })
            .on('error', err => resolve(makeResultError(err.toString())));
        } catch (err) {
          resolve(makeResultError(err.toString()));
        }
      });
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
            return resolve(makeResultError(err.toString()));
          }
          return resolve(makeGetSetResultSuccess(id, data));
        });
      });
    },
    async getList() {
      try {
        const [files] = await bucket.getFiles({
          prefix: rootNormalized,
        });

        const filenames = files.map(f => f.name);

        const rootRegExp = new RegExp(`^${rootNormalized}`);
        const resourceFilter =
          options.filter instanceof RegExp ? options.filter : new RegExp(`${options.filter ?? '.*(?<!/)'}$`);

        return makeGetListResultSuccees(
          filenames
            .filter(f => {
              // exclude directories and resource that not match suffix
              const isWithSuffix = resourceFilter.test(f);
              if (options.debug) {
                console.log(f, isWithSuffix ? 'is post file' : 'skipped');
              }

              return isWithSuffix;
            })
            .map(f => {
              return { id: pathToId(f.replace(rootRegExp, '')) };
            })
        );
      } catch (e) {
        return makeResultError(`Failed to get list of resources: ${e.toString()}`);
      }
    },
    async clear() {
      try {
        await bucket.deleteFiles({
          prefix: `${rootNormalized}`,
        });

        return makeGetListResultSuccees([]);
      } catch (e) {
        return makeResultError(`Failed to clear resources at "${rootNormalized}": ${e.toString()}`);
      }
    },
  };
}
