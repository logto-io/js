import { type PersistKey } from '@logto/client';

export type SessionData = {
  [PersistKey.AccessToken]?: string;
  [PersistKey.IdToken]?: string;
  [PersistKey.SignInSession]?: string;
  [PersistKey.RefreshToken]?: string;
};

export type Session = SessionData & {
  save: () => Promise<void>;
  getValues?: () => Promise<string>;
};

async function getKeyFromPassword(password: string, crypto: Crypto): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);

  // Convert the hash to a hex string
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function encrypt(text: string, password: string, crypto: Crypto) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedPlaintext = new TextEncoder().encode(text);

  const secretKey = await crypto.subtle.importKey(
    'raw',
    Buffer.from(await getKeyFromPassword(password, crypto), 'hex'),
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    secretKey,
    encodedPlaintext
  );

  return {
    ciphertext: Buffer.from(ciphertext).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
  };
}

async function decrypt(ciphertext: string, iv: string, password: string, crypto: Crypto) {
  const secretKey = await crypto.subtle.importKey(
    'raw',
    Buffer.from(await getKeyFromPassword(password, crypto), 'hex'),
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );

  const cleartext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: Buffer.from(iv, 'base64'),
    },
    secretKey,
    Buffer.from(ciphertext, 'base64')
  );

  return new TextDecoder().decode(cleartext);
}

export const unwrapSession = async (
  cookie: string,
  secret: string,
  crypto: Crypto = global.crypto
): Promise<SessionData> => {
  try {
    const [ciphertext, iv] = cookie.split('.');

    if (!ciphertext || !iv) {
      return {};
    }

    const decrypted = await decrypt(ciphertext, iv, secret, crypto);
    // eslint-disable-next-line no-restricted-syntax
    return JSON.parse(decrypted) as Session;
  } catch {
    // Ignore invalid session
  }

  return {};
};

export const wrapSession = async (
  session: SessionData,
  secret: string,
  crypto: Crypto = global.crypto
): Promise<string> => {
  const { ciphertext, iv } = await encrypt(JSON.stringify(session), secret, crypto);
  return `${ciphertext}.${iv}`;
};

type SessionConfigs = {
  secret: string;
  crypto: Crypto;
};

export const createSession = async (
  { secret, crypto }: SessionConfigs,
  cookie: string,
  setCookie?: (value: string) => void
): Promise<Session> => {
  const data = await unwrapSession(cookie, secret, crypto);

  const getValues = async () => wrapSession(session, secret, crypto);

  const session: Session = {
    ...data,
    save: async () => {
      setCookie?.(await getValues());
    },
    getValues,
  };

  return session;
};
