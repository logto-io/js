import { currentUnixTimeStamp, fetchOidcConfig, nocked } from './src/mock.js';

if (typeof window === 'undefined') {
  // This is required for vitest to work with nock
  nocked.get('*');
}

// Set up mock here is required for vitest mock to work with `@logto/js`. Don't know why.
vi.mock('@logto/js', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  fetchOidcConfig: async () => fetchOidcConfig(),
  decodeIdToken: vi.fn(() => ({
    iss: 'issuer_value',
    sub: 'subject_value',
    aud: 'audience_value',
    exp: currentUnixTimeStamp + 3600,
    iat: currentUnixTimeStamp,
    at_hash: 'at_hash_value',
  })),
  verifyIdToken: vi.fn(),
}));
