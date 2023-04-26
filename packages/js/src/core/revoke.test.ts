import { revoke } from './revoke.js';

describe('revoke', () => {
  test('requester should called with correct parameters', async () => {
    const revocationEndpoint = 'https://logto.dev/oidc/token/revocation';
    const clientId = 'clientId';
    const token = 'token';
    const mockedRequester = jest.fn();

    await expect(
      revoke(revocationEndpoint, clientId, token, mockedRequester)
    ).resolves.toBeUndefined();
    expect(mockedRequester).toBeCalledTimes(1);
    expect(mockedRequester).toBeCalledWith(revocationEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, token }),
    });
  });
});
