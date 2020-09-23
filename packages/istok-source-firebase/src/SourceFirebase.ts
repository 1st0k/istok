import { IdPathAdapterOptions } from '@istok/core';

import { Firebase } from './service';

export type FirebaseSourceOptons<T = {}> = {
  firebase: Firebase;
  options: T & {
    root: string;
    pathToId?: IdPathAdapterOptions['pathToId'];
    idToPath?: IdPathAdapterOptions['idToPath'];
  };
};
