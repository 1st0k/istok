export type IdPathAdapterOptions = {
  idDelimeter?: string;
  pathDelimeter?: string;
  pathToId(path: string, pathDelimeterRegExp: RegExp): string;
  idToPath(id: string, pathDelimeter: string, idDelimeterRegExp: RegExp): string;
};

export interface SourceOptions<T, R = unknown> {
  root: string;
  pathToId?: IdPathAdapterOptions['pathToId'];
  idToPath?: IdPathAdapterOptions['idToPath'];
  readTransform?(rawData: R): T;
  writeTransform?(data: T): R;
}

export const identityTransforms = {
  read<T, R>(rawResource: R) {
    return (rawResource as unknown) as T;
  },
  write<T, R>(data: T) {
    return (data as unknown) as R;
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
