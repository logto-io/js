export type LogtoRequestErrorBody = {
  code: string;
  message: string;
};

export type Requester = <T>(...args: Parameters<typeof fetch>) => Promise<T>;
