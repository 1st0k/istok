export type IdPathAdapterOptions = {
  idDelimeter?: string;
  pathDelimeter?: string;
  pathToId(path: string, pathDelimeterRegExp: RegExp): string;
  idToPath(id: string, pathDelimeter: string, idDelimeterRegExp: RegExp): string;
};

export interface SourceOptions<T> {
  root: string;
  pathToId?: IdPathAdapterOptions['pathToId'];
  idToPath?: IdPathAdapterOptions['idToPath'];
  readTransform?(rawData: unknown): T;
  writeTransform?(data: T): unknown;
}

export const identityTransforms = {
  read<T>(rawResource: unknown) {
    return rawResource as T;
  },
  write<T>(data: T) {
    return data;
  },
};

export function createIdPathAdapter({
  idDelimeter = '/',
  pathDelimeter = '/',
  pathToId,
  idToPath,
}: IdPathAdapterOptions) {
  const pathDelimeterRegExp = new RegExp(`${pathDelimeter}`, 'g');
  const idDelimeterRegExp = new RegExp(`${idDelimeter}`, 'g');

  return {
    delimetersRegExp: {
      path: pathDelimeterRegExp,
      id: idDelimeterRegExp,
    },
    delimeters: {
      path: pathDelimeter,
      id: idDelimeter,
    },
    pathToId(path: string) {
      return pathToId(path, pathDelimeterRegExp);
    },
    idToPath(id: string) {
      return idToPath(id, pathDelimeter, idDelimeterRegExp);
    },
  };
}
