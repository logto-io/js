import { fetchUserInfo, UserInfoResponse } from './user-info';

describe('fetchUserInfo', () => {
  test('should return UserInfoResponse', async () => {
    const userInfoResponse: UserInfoResponse = { sub: 'foo' };
    const fetchFunction = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => userInfoResponse,
    });
    await expect(
      fetchUserInfo('https://example.com/oidc/me', 'access_token_value', fetchFunction)
    ).resolves.toMatchObject(userInfoResponse);
  });
});
