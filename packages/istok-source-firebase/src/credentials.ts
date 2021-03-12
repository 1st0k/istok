/*
  List of variables names required to make credentials object 
*/
export const ENV_KEYS = [
  'project_id',
  'private_key_id',
  'private_key',
  'client_email',
  'client_id',
  'auth_uri',
  'token_uri',
  'auth_provider_x509_cert_url',
  'client_x509_cert_url',
] as const;

export type EnvKey = typeof ENV_KEYS[number];

type CredentialsObject = Record<EnvKey | 'type', string>;

export function isCredentialsObject(obj?: Record<string, any>, keyPrefix = '') {
  if (!obj) {
    return false;
  }
  for (const key of ENV_KEYS) {
    const keyName = `${keyPrefix}${key}`;
    if (typeof obj[keyName] === 'undefined') {
      return false;
    }
  }
  return true;
}

export function pickCredentialsObject(obj: Record<string, any>, keyPrefix = '') {
  const credentials: Partial<CredentialsObject> = {};
  for (const key of ENV_KEYS) {
    const keyName = `${keyPrefix}${key}`;
    if (typeof obj[keyName] === 'undefined') {
      return null;
    }
    credentials[key] = obj[keyName];
  }
  return credentials;
}

export type GetCredentialsOptions = {
  /* prefix of every key from ENV_KEYS list */
  credentialsKeysPrefix?: string;
  /* key of process.env where to look for whole credentials object */
  credentialsObjectKey?: string;
  /* if credentials at process.env[credentialsObjectKey] are encoded */
  isCredentialsObjectEncoded?: boolean;
};

export function getCredentialsFromEnv({
  credentialsKeysPrefix = '',
  credentialsObjectKey = 'FIREBASE_SERVICE_ACCOUNT',
  isCredentialsObjectEncoded = false,
}: GetCredentialsOptions = {}): CredentialsObject | null {
  /* look for credentials in separate credentials object from environment */
  let credentials: string | CredentialsObject | undefined = process.env[credentialsObjectKey];

  /* return credentials from object if valid or continue search */
  if (credentials) {
    try {
      const decodedCreds = isCredentialsObjectEncoded
        ? Buffer.from(credentials, 'base64').toString('ascii')
        : credentials;
      return JSON.parse(decodedCreds);
    } catch (e) {}
  }

  const getFirebaseCredentialsPart = (key: EnvKey): string => {
    const part = process.env[credentialsKeysPrefix + `FIREBASE_` + key];

    if (typeof part === 'undefined') {
      throw new Error();
    }

    return part;
  };

  /* compose credentials from partial values from environment */
  try {
    credentials = {
      type: 'service_account',
      project_id: getFirebaseCredentialsPart('project_id'),
      private_key_id: getFirebaseCredentialsPart('private_key_id'),
      private_key: getFirebaseCredentialsPart('private_key'),
      client_id: getFirebaseCredentialsPart('client_id'),
      client_email: getFirebaseCredentialsPart('client_email'),
      auth_uri: getFirebaseCredentialsPart('auth_uri'),
      token_uri: getFirebaseCredentialsPart('token_uri'),
      auth_provider_x509_cert_url: getFirebaseCredentialsPart('auth_provider_x509_cert_url'),
      client_x509_cert_url: getFirebaseCredentialsPart('client_x509_cert_url'),
    };

    return credentials;
  } catch (e) {
    /* credentials are not provided */
    return null;
  }
}
