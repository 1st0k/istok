import { SourceOptions } from '@istok/core';

import { Firebase } from './service';

export type FirebaseSourceOptons<T = unknown, O = {}, R = unknown> = {
  firebase?: Firebase;
  options: SourceOptions<T, R> & O;
};
