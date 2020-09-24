import path from 'path';
import fs from 'fs-extra';
import walk from 'klaw';
import {
  makeGetListResultSuccees,
  makeGetSetResultSuccess,
  makeResultError,
  UniformFiniteSource,
  createIdPathAdapter,
  SourceOptions,
} from '@istok/core';

export function meta() {
  return {
    name: `source-filesystem`,
    description: ``,
  };
}

interface FilesystemSourceOptions extends SourceOptions {
  filter?: RegExp | string;
}

export function createFilesystemSource<T>(opts: FilesystemSourceOptions): UniformFiniteSource<T, string> {
  const root = opts.root;

  const absoluteRootPath = path.resolve(root);

  if (!fs.existsSync(absoluteRootPath) || !fs.lstatSync(absoluteRootPath).isDirectory()) {
    throw new Error(`Unable to initialize FilesystemSource: directory ${absoluteRootPath} is not exist.`);
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

  function normalizePath(path: string) {
    return path.replace(/\\/g, '/');
  }

  async function getList() {
    function getAllFilenames() {
      const files: string[] = [];
      return new Promise<string[]>((res, rej) => {
        walk(root)
          .on('data', d => {
            if (d.stats.isFile()) {
              files.push(normalizePath(d.path));
            }
          })
          .on('error', e => rej(e))
          .on('end', () => {
            res(files);
          });
      });
    }

    try {
      const filenames = await getAllFilenames();

      const resourcePrefixRegExp = new RegExp(`^${normalizePath(path.resolve(root))}\/`, 'gi');

      return makeGetListResultSuccees(
        filenames.map(filename => {
          return { id: pathToId(filename.replace(resourcePrefixRegExp, '')) };
        })
      );
    } catch (e) {
      return makeResultError(`Failed to get list of resources: ${e.toString()}`);
    }
  }

  return {
    async get(id) {
      const resourcePath = idToPath(id);
      try {
        const result = ((await fs.readFile(resourcePath)).toString() as unknown) as T;

        return makeGetSetResultSuccess(id, result);
      } catch (error) {
        if (error.code === 'ENOENT') {
          return makeResultError(`Resource "${id}" (path: "${resourcePath}") is not exist.`);
        }
        return makeResultError(`Failed to get Resoruce with id "${id}", path: "${resourcePath}".`);
      }
    },
    async set(id, data) {
      const resourcePath = idToPath(id);

      try {
        await fs.ensureDir(path.dirname(resourcePath));
        await fs.writeFile(resourcePath, data);

        return makeGetSetResultSuccess(id, data);
      } catch (e) {
        return makeResultError(`Unable to save Resource "${id}". ${e.toString()}`);
      }
    },
    getList,
    async clear() {
      try {
        // remove the directory with all content
        await fs.remove(absoluteRootPath);
        // recreate empty directory
        await fs.mkdir(absoluteRootPath);

        return makeGetListResultSuccees([]);
      } catch (e) {
        return makeResultError(`Failed to clear resources at "${absoluteRootPath}": ${e.toString()}`);
      }
    },
  };
}
