export type LogtoRequestErrorBody = {
  code: string;
  message: string;
};

export type Requester = <T>(...args: Parameters<typeof fetch>) => Promise<T>;

// Need to align with the OIDC extraParams settings in core
export type InteractionMode = 'signIn' | 'signUp';
