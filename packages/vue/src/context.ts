import type LogtoClient from '@logto/browser';
import type { ComputedRef, Ref, UnwrapRef } from 'vue';
import { computed, reactive, toRefs } from 'vue';

type LogtoContextProperties = {
  logtoClient: LogtoClient | undefined;
  isAuthenticated: boolean;
  loadingCount: number;
  error: Error | undefined;
};

export type Context = {
  // Wrong type workaround. https://github.com/vuejs/core/issues/2981
  logtoClient: Ref<UnwrapRef<LogtoClient | undefined>>;
  isAuthenticated: Ref<boolean>;
  loadingCount: Ref<number>;
  error: Ref<Error | undefined>;
  isLoading: ComputedRef<boolean>;
  setError: (error: unknown, fallbackErrorMessage?: string | undefined) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
};

export const createContext = (client: LogtoClient): Context => {
  const context = toRefs(
    reactive<LogtoContextProperties>({
      logtoClient: client,
      isAuthenticated: false,
      loadingCount: 1,
      error: undefined,
    })
  );

  const { isAuthenticated, loadingCount, error } = context;

  const isLoading = computed(() => loadingCount.value > 0);

  /* eslint-disable @silverhand/fp/no-mutation */
  const setError = (_error: unknown, fallbackErrorMessage?: string) => {
    if (_error instanceof Error) {
      error.value = _error;
    } else if (fallbackErrorMessage) {
      error.value = new Error(fallbackErrorMessage);
    }
    console.error(error);
  };

  const setLoading = (isLoading: boolean) => {
    if (isLoading) {
      loadingCount.value += 1;
    } else {
      loadingCount.value = Math.max(0, loadingCount.value - 1);
    }
  };

  const setIsAuthenticated = (_isAuthenticated: boolean) => {
    isAuthenticated.value = _isAuthenticated;
  };
  /* eslint-enable @silverhand/fp/no-mutation */

  (async () => {
    const isAuthenticated = await client.isAuthenticated();

    setIsAuthenticated(isAuthenticated);
    setLoading(false);
  })();

  return { ...context, isLoading, setError, setLoading, setIsAuthenticated };
};

export const throwContextError = (): never => {
  throw new Error('Must install Logto plugin first.');
};
