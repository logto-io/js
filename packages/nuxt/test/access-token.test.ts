import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

import { LogtoClientError, LogtoRequestError, type default as LogtoClient } from '@logto/node';
import { createEvent, type H3Event } from 'h3';
import { describe, expect, it, vi } from 'vitest';

import { respondWithAccessToken } from '../src/runtime/utils/access-token';
import { NotAuthenticatedErrorCode } from '../src/runtime/utils/constants';

const createH3Event = (): H3Event => {
  const incoming = new IncomingMessage(new Socket());
  return createEvent(incoming, new ServerResponse(incoming));
};

const createMockClient = ({
  isAuthenticated = true,
  getAccessToken = vi.fn().mockResolvedValue('access_token'),
}: {
  isAuthenticated?: boolean;
  getAccessToken?: ReturnType<typeof vi.fn>;
} = {}) => {
  const client = {
    isAuthenticated: vi.fn().mockResolvedValue(isAuthenticated),
    getAccessToken,
    clearAllTokens: vi.fn(async () => {
      // The handler only needs the call to succeed.
    }),
  } as unknown as LogtoClient;

  return { client, getAccessToken };
};

const expectedNotAuthenticatedError = {
  statusCode: 401,
  data: { code: NotAuthenticatedErrorCode },
};

describe('respondWithAccessToken', () => {
  it('returns the access token and disables response caching', async () => {
    const event = createH3Event();
    const { client } = createMockClient();

    await expect(respondWithAccessToken(event, client)).resolves.toEqual({
      accessToken: 'access_token',
    });
    expect(event.node.res.getHeader('cache-control')).toBe('no-store');
  });

  it('forwards the resource and organization to the client', async () => {
    const event = createH3Event();
    const { client, getAccessToken } = createMockClient();

    await respondWithAccessToken(event, client, {
      resource: 'https://api.example.com',
      organizationId: 'org_123',
    });

    expect(getAccessToken).toHaveBeenCalledWith('https://api.example.com', 'org_123');
  });

  it('throws an authentication error when the session is missing', async () => {
    const event = createH3Event();
    const { client, getAccessToken } = createMockClient({ isAuthenticated: false });

    await expect(respondWithAccessToken(event, client)).rejects.toMatchObject(
      expectedNotAuthenticatedError
    );
    // An unauthenticated request must not attempt a refresh.
    expect(getAccessToken).not.toHaveBeenCalled();
  });

  it('throws an authentication error when there is no refresh token', async () => {
    const event = createH3Event();
    const { client } = createMockClient({
      getAccessToken: vi
        .fn()
        .mockRejectedValue(new LogtoClientError('not_authenticated', 'Refresh token not found')),
    });

    await expect(respondWithAccessToken(event, client)).rejects.toMatchObject(
      expectedNotAuthenticatedError
    );
  });

  it('clears the session and throws an authentication error when the refresh token is rejected', async () => {
    const event = createH3Event();
    const { client } = createMockClient({
      getAccessToken: vi.fn().mockRejectedValue(new LogtoRequestError('invalid_grant', 'Invalid')),
    });

    await expect(respondWithAccessToken(event, client)).rejects.toMatchObject(
      expectedNotAuthenticatedError
    );
    expect(client.clearAllTokens).toHaveBeenCalled();
  });

  it('does not clear the session or mask unexpected failures', async () => {
    const event = createH3Event();
    const error = new LogtoRequestError('rate_limited', 'Too many requests');
    const { client } = createMockClient({
      getAccessToken: vi.fn().mockRejectedValue(error),
    });

    await expect(respondWithAccessToken(event, client)).rejects.toBe(error);
    expect(client.clearAllTokens).not.toHaveBeenCalled();
  });
});
