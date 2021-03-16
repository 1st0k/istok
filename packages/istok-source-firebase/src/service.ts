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
}

export function startService({
  envFilePath = '',
  debug = false,
  passCredentialsToEmulator = false,
  credentialsFromEnvOptions = {},
}: ServiceParams = {}) {
  const isApp = admin.apps.length;

  if (isApp) {
    return admin.app();
  }

  const envFileRecord = envsFromFile(envFilePath).parsed || {};

  const isUseEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
  // Pass credentials to emulator only if corresponding flag is set
  const shouldPassCredentials = !isUseEmulator || passCredentialsToEmulator;

  if (isUseEmulator) {
    console.log('Using Firestore emulator: ', process.env.FIRESTORE_EMULATOR_HOST);
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
    return admin.initializeApp();
  }

  return admin.initializeApp({
    // ...JSON.parse(process.env.FIREBASE_CONFIG ?? '{}'),
    credential: admin.credential.cert(credentials as admin.ServiceAccount),
  });
}

export type Firebase = ReturnType<typeof startService>;
