import {
  APP_INITIALIZER,
  createEnvironmentInjector,
  platformCore,
  type EnvironmentInjector,
  type Provider,
} from '@angular/core';
import LogtoClient from '@logto/browser';

import { LOGTO_CLIENT, provideLogto } from './provider.js';
import { LogtoService } from './service.js';

const config = {
  endpoint: 'https://logto.example',
  appId: 'app-id',
};

const platform = platformCore();
const platformInjector = platform.injector as EnvironmentInjector;
const createInjector = (additionalProviders: Provider[] = []) =>
  createEnvironmentInjector(
    [provideLogto(config, { unstable_enableCache: true }), ...additionalProviders],
    platformInjector
  );

describe('provideLogto', () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterAll(() => {
    platform.destroy();
  });

  it('provides singleton client and service instances with the configured cache', () => {
    const injector = createInjector();
    const client = injector.get(LOGTO_CLIENT);
    const service = injector.get(LogtoService);

    expect(client).toBeInstanceOf(LogtoClient);
    expect(client.logtoConfig).toMatchObject(config);
    expect(client.adapter.unstable_cache).toBeDefined();
    expect(injector.get(LOGTO_CLIENT)).toBe(client);
    expect(injector.get(LogtoService)).toBe(service);
    injector.destroy();
  });

  it('uses an Angular DI override for the underlying client', async () => {
    const isAuthenticated = vi.fn(async () => true);
    const client = { isAuthenticated } as unknown as LogtoClient;
    const injector = createInjector([{ provide: LOGTO_CLIENT, useValue: client }]);

    const service = injector.get(LogtoService);
    await service.initialize();

    expect(injector.get(LOGTO_CLIENT)).toBe(client);
    expect(isAuthenticated).toHaveBeenCalledTimes(1);
    expect(service.isAuthenticated()).toBe(true);
    injector.destroy();
  });

  it('registers non-blocking browser initialization with Angular', () => {
    const isAuthenticated = vi.fn(async () => true);
    const client = { isAuthenticated } as unknown as LogtoClient;
    const injector = createInjector([{ provide: LOGTO_CLIENT, useValue: client }]);

    const initializers = injector.get(APP_INITIALIZER);

    expect(initializers).toHaveLength(1);
    expect(isAuthenticated).not.toHaveBeenCalled();
    expect(injector.get(LogtoService).isLoading()).toBe(true);
    injector.destroy();
  });
});
