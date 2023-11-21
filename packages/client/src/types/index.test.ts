import { ReservedResource, UserScope } from '@logto/js';

import { normalizeLogtoConfig } from './index.js';

describe('normalizeLogtoConfigs', () => {
  it('should be able to add missing scopes', () => {
    const normalized = normalizeLogtoConfig({
      appId: '123',
      endpoint: 'https://example.com',
    });
    expect(normalized.scopes).toEqual(['openid', 'offline_access', 'profile']);
    expect(normalized.resources).toBeUndefined();
  });

  it('should be able to add missing resources', () => {
    const normalized = normalizeLogtoConfig({
      appId: '123',
      endpoint: 'https://example.com',
      scopes: ['openid', 'offline_access', 'profile', UserScope.Organizations],
    });
    expect(normalized.scopes).toEqual([
      'openid',
      'offline_access',
      'profile',
      UserScope.Organizations,
    ]);
    expect(normalized.resources).toEqual([ReservedResource.Organization]);
  });

  it('should be able to deduplicate scopes and resources', () => {
    const normalized = normalizeLogtoConfig({
      appId: '123',
      endpoint: 'https://example.com',
      scopes: ['openid', UserScope.Organizations, UserScope.Organizations],
      resources: ['123', '123'],
    });
    expect(normalized.scopes).toEqual([
      'openid',
      'offline_access',
      'profile',
      UserScope.Organizations,
    ]);
    expect(normalized.resources).toEqual(['123', ReservedResource.Organization]);
  });
});
