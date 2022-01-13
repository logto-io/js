import { isNode } from '@silverhand/essentials';

export const nowRoundToSec = () => Math.floor(Date.now() / 1000);

export const createDefaultOnRedirect = () => {
  if (isNode()) {
    throw new Error('You should provide a onRedirect function in NodeJS');
  }

  return (url: string) => {
    window.location.assign(url);
  };
};

export const appendSlashIfNeeded = (url: string): string => {
  if (url.endsWith('/')) {
    return url;
  }

  return url + '/';
};

// Expected NOOP function for optional callback fn fallback use
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const NOOP = () => {};
