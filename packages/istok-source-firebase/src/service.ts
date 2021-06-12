import dotenv from 'dotenv';
import * as admin from 'firebase-admin';

import { getCredentialsFromEnv, GetCredentialsOptions, pickCredentialsObject } from './credentials';

function envsFromFile(path?: string) {
  return dotenv.config(path ? { path } : undefined);
}

export interface ServiceParams {
  envFilePath?: string;
  credentialsFromEnvOptions?: GetCredentialsOptions;
  debug?: boolean;
  passCredentialsToEmulator?: boolean;
  defaultBucket?: string;
  projectId?: string;
}

export function startService({
  envFilePath = '',
  debug = false,
  passCredentialsToEmulator = false,
  credentialsFromEnvOptions = {},
  defaultBucket,
  projectId,
}: ServiceParams = {}) {
  const isApp = admin.apps.length;

  if (isApp) {
    return { app: admin.app(), firebase: admin };
  }

  const envFileRecord = envsFromFile(envFilePath).parsed || {};
  const storageBucket = defaultBucket || process.env.FIREBASE_STORAGE_BUCKET;

  const isUseEmulator = !!process.env.FIRESTORE_EMULATOR_HOST || !!process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  // Pass credentials to emulator only if corresponding flag is set
  const shouldPassCredentials = !isUseEmulator || passCredentialsToEmulator;

  if (isUseEmulator) {
    console.log('Using Firestore emulator:', process.env.FIRESTORE_EMULATOR_HOST);
    console.log('Using Storage emulator:', process.env.FIREBASE_STORAGE_EMULATOR_HOST);

    return {
      app: admin.initializeApp({
        projectId: projectId || process.env.project_id,
        credential: admin.credential.applicationDefault(),
        storageBucket,
      }),
      firebase: admin,
    };
  }

  const credentials = shouldPassCredentials
    ? pickCredentialsObject(envFileRecord) ?? getCredentialsFromEnv(credentialsFromEnvOptions)
    : null;

  if (debug) {
    console.log('firebase: envs is gathered from file or env variables');
  }

  // if there are no envs — we are should be inside Firebase Cloud, so config will be provided automatically
  if (!credentials) {
    if (debug) {
      console.log('firebase: using default credentials');
    }
    return {
      app: admin.initializeApp(),
      firebase: admin,
    };
  }

  return {
    app: admin.initializeApp({
      // ...JSON.parse(process.env.FIREBASE_CONFIG ?? '{}'),
      credential: admin.credential.cert(credentials as admin.ServiceAccount),
      storageBucket,
    }),
    firebase: admin,
  };
}

export type Firebase = ReturnType<typeof startService>;
