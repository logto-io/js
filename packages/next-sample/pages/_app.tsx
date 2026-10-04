import { type AppProps } from 'next/app';
import { SWRConfig } from 'swr';

import fetchJson from '../libraries/fetch-json';

/**
 * Monkey-patch the AppProps since it is annoying to match the exact version of `@types/react`.
 * @see https://stackoverflow.com/questions/71809903/next-js-component-cannot-be-used-as-a-jsx-component
 */
type PatchedAppProps = Omit<AppProps, 'Component'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly Component: any;
};

const MyApp = ({ Component, pageProps }: PatchedAppProps) => {
  return (
    <SWRConfig
      value={{
        fetcher: fetchJson,
        onError: (error) => {
          console.error(error);
        },
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
};

export default MyApp;
