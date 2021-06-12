import path from 'path';
import fs, { readFile } from 'fs-extra';
import walk from 'klaw';
import {
  Source,
  createIdPathAdapter,
  SourceOptions,
  identityTransforms,
  QueryParams,
  error,
  QueryResult,
  Id,
  ResultError,
  entityResponse,
  success,
  Entity,
} from '@istok/core';

interface GetAllFilenamesParams {
  exclude?: RegExp | string;
  root: string;
  query?: QueryParams;
}

function normalizePath(path: string) {
  return path.replace(/\\/g, '/');
}

function getAllFilenames(opts: GetAllFilenamesParams) {
  const { root, query = {} } = opts;
  const { offset = 0, limit = 0 } = query;

  const resourcePrefixRegExp = new RegExp(`^${normalizePath(path.resolve(root))}\/`, 'gi');

  const files: string[] = [];
  const exclude =
    opts.exclude instanceof RegExp
      ? opts.exclude
      : typeof opts.exclude === 'string'
      ? new RegExp(`${opts.exclude}`)
      : null;

  let count = 0;
  let currentIndex = 0;

  return new Promise<string[]>((res, rej) => {
    walk(root)
      .on('data', d => {
        if (d.stats.isFile()) {
          const normalizedPath = normalizePath(d.path).replace(resourcePrefixRegExp, '');

          if (exclude && exclude.test(normalizedPath)) {
            return;
          }

          if (currentIndex < offset || (limit && count >= limit)) {
            return;
          }

          files.push(normalizedPath);
          currentIndex++;
        }
      })
      .on('error', e => rej(e))
      .on('end', () => {
        res(files);
      });
  });
}

export function meta() {
  return {
    name: `source-filesystem`,
    description: ``,
  };
}

interface FilesystemSourceOptions<T> extends SourceOptions<T> {
  exclude?: RegExp | string;
  autoCreateRoot?: boolean;
}

export function createFilesystemSource<T>(opts: FilesystemSourceOptions<T>): Source<T> {
  const root = opts.root;

  const { readTransform = identityTransforms.read, writeTransform = identityTransforms.write } = opts;

  const absoluteRootPath = path.resolve(root);

  if (!fs.existsSync(absoluteRootPath) || !fs.lstatSync(absoluteRootPath).isDirectory()) {
    if (opts.autoCreateRoot) {
      fs.ensureDirSync(absoluteRootPath);
    } else {
      throw new Error(`Unable to initialize FilesystemSource: directory ${absoluteRootPath} is not exist.`);
    }
  }

  const { pathToId, idToPath } = createIdPathAdapter({
    idDelimeter: '/',
    pathDelimeter: '/',
    pathToId:
      opts.pathToId ??
      function defaultPathToId(path, pathDelimeterRegExp) {
        return path.replace(pathDelimeterRegExp, '/');
      },

    idToPath:
      opts.idToPath ??
      function(id, pathDelimeter, idDelimeterRegExp) {
        return path.resolve(root, id.replace(idDelimeterRegExp, pathDelimeter));
      },
  });

  async function ids(params: QueryParams): Promise<QueryResult<Id> | ResultError> {
    try {
      const filenames = await getAllFilenames({ root, exclude: opts.exclude, query: params });
      const ids = filenames
        .map(filename => pathToId(filename))
        .filter(id => (params.filter ? params.filter(id) : true));

      return {
        kind: 'Success',
        data: ids,
        next: null,
        prev: null,
      };
    } catch (e) {
      return error(`Failed to get ids of entities: ${e.toString()}`);
    }
  }

  async function query(params: QueryParams): Promise<QueryResult<Entity<T>> | ResultError> {
    try {
      const filenames = await getAllFilenames({ root, exclude: opts.exclude, query: params });
      const ids = filenames
        .map(filename => pathToId(filename))
        .filter(id => (params.filter ? params.filter(id) : true));

      const filteredFilenames = ids.map(id => idToPath(id));

      const contents = (
        await Promise.all(
          filteredFilenames.map(f => {
            return readFile(f);
          })
        )
      ).map((buffer, index) => ({
        entity: readTransform(buffer.toString()),
        id: ids[index],
      }));

      return {
        kind: 'Success',
        data: contents,
        next: null,
        prev: null,
      };
    } catch (e) {
      return error(`Failed to get ids of entities: ${e.toString()}`);
    }
  }

  return {
    async get(id) {
      const resourcePath = idToPath(id);
      try {
        const result = ((await fs.readFile(resourcePath)).toString() as unknown) as T;

        return entityResponse(id, readTransform(result));
      } catch (e) {
        if (e.code === 'ENOENT') {
          return error(`Resource "${id}" (path: "${resourcePath}") is not exist.`);
        }
        return error(`Failed to get Resoruce with id "${id}", path: "${resourcePath}".`);
      }
    },
    async set(id, data) {
      const resourcePath = idToPath(id);

      try {
        await fs.ensureDir(path.dirname(resourcePath));
        const transformedData = writeTransform(data);
        await fs.writeFile(resourcePath, transformedData);

        return success('OK');
      } catch (e) {
        return error(`Unable to save Resource "${id}". ${e.toString()}`);
      }
    },
    ids,
    query,
    async delete(id) {
      const resourcePath = idToPath(id);
      try {
        await fs.remove(resourcePath);
        return success('OK');
      } catch (e) {
        return error(`Unable to remove Resource "${id}" (path: ${resourcePath}): ${e.toString()}`);
      }
    },
    async clear() {
      try {
        // remove the directory with all content
        await fs.remove(absoluteRootPath);
        // recreate empty directory
        await fs.mkdir(absoluteRootPath);

        return success('OK');
      } catch (e) {
        return error(`Failed to clear resources at "${absoluteRootPath}": ${e.toString()}`);
      }
    },
  };
}
