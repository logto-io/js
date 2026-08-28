import { computed, signal, type Signal } from '@angular/core';
import type LogtoClient from '@logto/browser';
import type {
  AccessTokenClaims,
  IdTokenClaims,
  SignInOptions,
  UserInfoResponse,
} from '@logto/browser';

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(`Unexpected error: ${String(error)}`);

/**
 * Angular-native state and operations for the underlying Logto Browser client.
 *
 * Register this service with {@link provideLogto}, then inject it into components and services.
 */
export class LogtoService {
  /** Whether the current browser session has an ID token. */
  readonly isAuthenticated: Signal<boolean>;

  /** Whether initialization or one or more SDK operations are pending. */
  readonly isLoading: Signal<boolean>;

  /** The latest SDK operation error, if any. */
  readonly error: Signal<Error | undefined>;

  private readonly authenticatedState = signal(false);
  private readonly loadingCount = signal(1);
  // eslint-disable-next-line unicorn/no-useless-undefined -- Angular signal requires an initial value
  private readonly errorState = signal<Error | undefined>(undefined);
  private initializationPromise?: Promise<void>;

  constructor(private readonly client: LogtoClient) {
    this.isAuthenticated = this.authenticatedState.asReadonly();
    this.isLoading = computed(() => this.loadingCount() > 0);
    this.error = this.errorState.asReadonly();
  }

  /**
   * Restore authentication state from browser storage.
   *
   * The operation is idempotent. Initialization failures are exposed through {@link error} and do
   * not reject, so they cannot prevent the Angular application from starting.
   */
  async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.clearError();
    const initializationPromise = (async () => {
      try {
        this.authenticatedState.set(await this.client.isAuthenticated());
      } catch (error: unknown) {
        this.errorState.set(toError(error));
      } finally {
        this.stopLoading();
      }
    })();

    this.initializationPromise = initializationPromise;
    return initializationPromise;
  }

  /** Start the Logto sign-in redirect flow. */
  async signIn(options: SignInOptions): Promise<void>;
  /** Start the Logto sign-in redirect flow. */
  async signIn(redirectUri: SignInOptions['redirectUri']): Promise<void>;
  /**
   * Start the Logto sign-in redirect flow.
   *
   * @deprecated Use the object parameter instead.
   */
  async signIn(
    redirectUri: SignInOptions['redirectUri'],
    interactionMode?: SignInOptions['interactionMode'],
    // eslint-disable-next-line @typescript-eslint/unified-signatures -- preserve Browser client overloads
    loginHint?: SignInOptions['loginHint']
  ): Promise<void>;
  async signIn(
    options: SignInOptions | string | URL,
    interactionMode?: SignInOptions['interactionMode'],
    loginHint?: SignInOptions['loginHint']
  ): Promise<void> {
    return this.run(async () => {
      if (typeof options === 'string' || options instanceof URL) {
        return this.client.signIn(options, interactionMode, loginHint);
      }

      return this.client.signIn(options);
    }, true);
  }

  /** Revoke local credentials and start the Logto sign-out redirect flow. */
  async signOut(postLogoutRedirectUri?: string): Promise<void> {
    return this.run(async () => this.client.signOut(postLogoutRedirectUri), true);
  }

  /** Exchange the authorization callback for tokens and mark the session as authenticated. */
  async handleSignInCallback(callbackUri: string): Promise<void> {
    return this.run(async () => {
      await this.client.handleSignInCallback(callbackUri);
      this.authenticatedState.set(true);
    });
  }

  /** Get the persisted refresh token. */
  // eslint-disable-next-line @typescript-eslint/ban-types -- preserve Browser client return type
  async getRefreshToken(): Promise<string | null> {
    return this.run(async () => this.client.getRefreshToken());
  }

  /** Get an access token for the OIDC or requested API resource. */
  async getAccessToken(resource?: string): Promise<string> {
    return this.run(async () => this.client.getAccessToken(resource));
  }

  /** Get decoded claims for an OIDC or API-resource access token. */
  async getAccessTokenClaims(resource?: string): Promise<AccessTokenClaims> {
    return this.run(async () => this.client.getAccessTokenClaims(resource));
  }

  /** Get an access token for a Logto organization. */
  async getOrganizationToken(organizationId: string): Promise<string> {
    return this.run(async () => this.client.getOrganizationToken(organizationId));
  }

  /** Get decoded claims for a Logto organization token. */
  async getOrganizationTokenClaims(organizationId: string): Promise<AccessTokenClaims> {
    return this.run(async () => this.client.getOrganizationTokenClaims(organizationId));
  }

  /** Get the persisted ID token. */
  // eslint-disable-next-line @typescript-eslint/ban-types -- preserve Browser client return type
  async getIdToken(): Promise<string | null> {
    return this.run(async () => this.client.getIdToken());
  }

  /** Get decoded claims for the persisted ID token. */
  async getIdTokenClaims(): Promise<IdTokenClaims> {
    return this.run(async () => this.client.getIdTokenClaims());
  }

  /** Fetch user information from the OIDC userinfo endpoint. */
  async fetchUserInfo(): Promise<UserInfoResponse> {
    return this.run(async () => this.client.fetchUserInfo());
  }

  /** Clear all cached access tokens without changing authentication state. */
  async clearAccessToken(): Promise<void> {
    return this.run(async () => this.client.clearAccessToken());
  }

  /** Clear all local tokens and mark the session as unauthenticated. */
  async clearAllTokens(): Promise<void> {
    return this.run(async () => {
      await this.client.clearAllTokens();
      this.authenticatedState.set(false);
    });
  }

  /** Clear the latest SDK operation error. */
  clearError(): void {
    this.errorState.set(undefined);
  }

  private startLoading() {
    this.loadingCount.update((count) => count + 1);
  }

  private stopLoading() {
    this.loadingCount.update((count) => Math.max(0, count - 1));
  }

  private async run<Result>(
    operation: () => Promise<Result>,
    keepLoadingOnSuccess = false
  ): Promise<Result> {
    this.clearError();
    this.startLoading();

    try {
      const result = await operation();

      if (!keepLoadingOnSuccess) {
        this.stopLoading();
      }

      return result;
    } catch (error: unknown) {
      this.errorState.set(toError(error));
      this.stopLoading();
      throw error;
    }
  }
}
