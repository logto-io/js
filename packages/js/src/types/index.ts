export type LogtoRequestErrorBody = {
  code: string;
  message: string;
};
 // @ts-expect-error Temporary blocking of fetch function does not exist at @types/node
export type Requester = <T>(...args: Parameters<typeof fetch>) => Promise<T>;

// Need to align with the OIDC extraParams settings in core
export type InteractionMode = 'signIn' | 'signUp';
