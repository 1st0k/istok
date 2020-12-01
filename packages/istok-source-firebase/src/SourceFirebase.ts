import { SourceOptions } from '@istok/core';

import { Firebase } from './service';

export type FirebaseSourceOptons<T = unknown, O = {}> = {
  firebase?: Firebase;
  options: O & SourceOptions<T>;
};
