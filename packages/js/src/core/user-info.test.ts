import type { UserInfoResponse } from './user-info.js';
import { fetchUserInfo } from './user-info.js';

describe('fetchUserInfo', () => {
  test('should return UserInfoResponse', async () => {
    const userInfoResponse: UserInfoResponse = {
      sub: 'foo',
      iss: 'bar',
      aud: 'baz',
      iat: 123,
      exp: 123,
    };
    const fetchFunction = vi.fn().mockResolvedValue(userInfoResponse);
    await expect(
      fetchUserInfo('https://example.com/oidc/me', 'access_token_value', fetchFunction)
    ).resolves.toMatchObject(userInfoResponse);
  });
});
