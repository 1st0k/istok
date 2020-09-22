export { startService, Firebase, ServiceParams } from './service';
export { createFirestoreSource, FirestoreSourceOptions } from './SourceFirestore';

export function meta() {
  return {
    name: `{{MODULE_NAME}}`,
    description: `{{MODULE_DESCRIPTION}}`,
  };
}
