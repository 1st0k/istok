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
}

export function startService({ envFilePath = '', debug = false, credentialsFromEnvOptions = {} }: ServiceParams = {}) {
  const isApp = admin.apps.length;

  if (isApp) {
    return admin.app();
  }

  const credentialsFromEnvFile = envsFromFile(envFilePath).parsed || {};
  const credentials = pickCredentialsObject(credentialsFromEnvFile) ?? getCredentialsFromEnv(credentialsFromEnvOptions);

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
