import path from 'path';
import fs from 'fs-extra';
import walk from 'klaw';
import { makeGetListResultSuccees, makeGetSetResultSuccess, makeResultError, UniformFiniteSource } from '@istok/core';

export function meta() {
  return {
    name: `source-filesystem`,
    description: ``,
  };
}

interface FilesystemSourceOptions {
  root: string;
  filter?: RegExp | string;
  pathToId?(path: string, pathDelimeterRegExp: RegExp): string;
  idToPath?(id: string, pathDelimeter: string): string;
}

export function createFilesystemSource<T>(opts: FilesystemSourceOptions): UniformFiniteSource<T, string> {
  const root = opts.root;

  const absoluteRootPath = path.resolve(root);

  if (!fs.existsSync(absoluteRootPath) || !fs.lstatSync(absoluteRootPath).isDirectory()) {
    throw new Error(`Unable to initialize FilesystemSource: directory ${absoluteRootPath} is not exist.`);
  }

  const DEFAULT_PATH_DELIMETER = '/';
  const DEFAULT_ID_DELIMETER = '/';
  const pathDelimeterRegExp = new RegExp(`${DEFAULT_PATH_DELIMETER}`, 'g');
  const idDelimeterRegExp = new RegExp(`${DEFAULT_ID_DELIMETER}`, 'g');

  const pathToId =
    opts.pathToId ??
    function defaultPathToId(path: string, pathDelimeterRegExp: RegExp) {
      return path.replace(pathDelimeterRegExp, DEFAULT_ID_DELIMETER);
    };

  const idToPath =
    opts.idToPath ??
    function(id: string, pathDelimeter = DEFAULT_PATH_DELIMETER) {
      return path.resolve(root, id.replace(idDelimeterRegExp, pathDelimeter));
    };

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

    const filenames = await getAllFilenames();

    const resourcePrefixRegExp = new RegExp(`^${normalizePath(path.resolve(root))}\/`, 'gi');

    return makeGetListResultSuccees(
      filenames.map(filename => {
        return { id: pathToId(filename.replace(resourcePrefixRegExp, ''), pathDelimeterRegExp) };
      })
    );
  }

  return {
    async get(id) {
      const resourcePath = idToPath(id, DEFAULT_PATH_DELIMETER);
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
      const resourcePath = idToPath(id, DEFAULT_PATH_DELIMETER);

      try {
        await fs.ensureDir(path.dirname(resourcePath));
        await fs.writeFile(resourcePath, data);

        return makeGetSetResultSuccess(id, data);
      } catch (e) {
        return makeResultError(`Unable to save Resource "${id}". ${e.toString()}`);
      }
    },
    getList,
  };
}
