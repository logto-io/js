import type { AccessTokenClaims, IdTokenClaims } from '@logto/node';

import type { LogtoNextConfig } from '../src/types.js';

import {
  getAccessTokenClaims,
  getAccessTokenClaimsRSC,
  getIdTokenClaims,
  getOrganizationTokenClaims,
  getOrganizationTokenClaimsRSC,
} from './index.js';

const idTokenClaims: IdTokenClaims = {
  aud: 'app-id',
  exp: 1_700_000_000,
  iat: 1_600_000_000,
  iss: 'https://logto.example.com/oidc',
  sub: 'user-id',
};
const accessTokenClaims: AccessTokenClaims = { sub: 'access-token-user-id' };
const organizationTokenClaims: AccessTokenClaims = { sub: 'organization-token-user-id' };

const getIdTokenClaimsFromClient = vi.fn(async () => idTokenClaims);
const getAccessTokenClaimsFromClient = vi.fn(async (_resource?: string) => accessTokenClaims);
const getOrganizationTokenClaimsFromClient = vi.fn(
  async (_organizationId: string) => organizationTokenClaims
);
const createNodeClient = vi.fn(async () => ({
  getIdTokenClaims: getIdTokenClaimsFromClient,
  getAccessTokenClaims: getAccessTokenClaimsFromClient,
  getOrganizationTokenClaims: getOrganizationTokenClaimsFromClient,
}));

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('./client', () => ({
  default: vi.fn(() => ({ createNodeClient })),
}));

const config: LogtoNextConfig = {
  appId: 'app-id',
  baseUrl: 'https://app.example.com',
  cookieSecret: 'complex_password_at_least_32_characters_long',
  cookieSecure: false,
  endpoint: 'https://logto.example.com',
};

describe('Next (server actions): token claims', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('gets ID token claims without enabling cookie writes', async () => {
    await expect(getIdTokenClaims(config)).resolves.toEqual(idTokenClaims);

    expect(createNodeClient).toHaveBeenCalledWith({ ignoreCookieChange: true });
    expect(getIdTokenClaimsFromClient).toHaveBeenCalledOnce();
  });

  it('gets access and organization token claims with cookie persistence enabled', async () => {
    await expect(getAccessTokenClaims(config, 'https://api.example.com')).resolves.toEqual(
      accessTokenClaims
    );
    await expect(getOrganizationTokenClaims(config, 'org-id')).resolves.toEqual(
      organizationTokenClaims
    );

    expect(createNodeClient).toHaveBeenNthCalledWith(1);
    expect(createNodeClient).toHaveBeenNthCalledWith(2);
    expect(getAccessTokenClaimsFromClient).toHaveBeenCalledWith('https://api.example.com');
    expect(getOrganizationTokenClaimsFromClient).toHaveBeenCalledWith('org-id');
  });

  it('gets access and organization token claims without cookie writes in RSC', async () => {
    await expect(getAccessTokenClaimsRSC(config, 'https://api.example.com')).resolves.toEqual(
      accessTokenClaims
    );
    await expect(getOrganizationTokenClaimsRSC(config, 'org-id')).resolves.toEqual(
      organizationTokenClaims
    );

    expect(createNodeClient).toHaveBeenNthCalledWith(1, { ignoreCookieChange: true });
    expect(createNodeClient).toHaveBeenNthCalledWith(2, { ignoreCookieChange: true });
    expect(getAccessTokenClaimsFromClient).toHaveBeenCalledWith('https://api.example.com');
    expect(getOrganizationTokenClaimsFromClient).toHaveBeenCalledWith('org-id');
  });
});
