import { SourceOptions } from '@istok/core';

import { Firebase } from './service';

export type FirebaseSourceOptons<T = {}> = {
  firebase?: Firebase;
  options: T & SourceOptions;
};
