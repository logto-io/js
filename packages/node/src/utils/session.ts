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

export type KVAdapter = {
  get: (key: string) => Promise<string | undefined>;
  set: (key: string, value: string, ttlSeconds?: number) => Promise<void>;
};

export type KVSessionWrapperOptions = {
  keyPrefix?: string;
  ttl?: number;
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

export const unwrapSession = async (cookie: string, secret: string): Promise<SessionData> => {
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

export const wrapSession = async (session: SessionData, secret: string): Promise<string> => {
  const { ciphertext, iv } = await encrypt(JSON.stringify(session), secret, crypto);
  return `${ciphertext}.${iv}`;
};

export const createKVSessionWrapper = (
  kv: KVAdapter,
  options: KVSessionWrapperOptions = {}
): {
  wrap: (data: SessionData, key: string) => Promise<string>;
  unwrap: (value: string, key: string) => Promise<SessionData>;
} => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let currentSessionId: string | undefined;
  const prefix = options.keyPrefix ?? 'logto_session_';
  const ttl = options.ttl ?? 14 * 24 * 3600;

  return {
    async wrap(data: SessionData, _key: string): Promise<string> {
      const sessionId = currentSessionId ?? crypto.randomUUID();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      currentSessionId = sessionId;
      await kv.set(`${prefix}${sessionId}`, JSON.stringify(data), ttl);
      return sessionId;
    },
    async unwrap(value: string, _key: string): Promise<SessionData> {
      if (!value) {
        return {};
      }

      // eslint-disable-next-line @silverhand/fp/no-mutation
      currentSessionId = value;
      const data = await kv.get(`${prefix}${value}`);

      if (!data) {
        return {};
      }

      try {
        // eslint-disable-next-line no-restricted-syntax
        return JSON.parse(data) as SessionData;
      } catch {
        return {};
      }
    },
  };
};
