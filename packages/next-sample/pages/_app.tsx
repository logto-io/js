import { AppProps } from 'next/app';
import { SWRConfig } from 'swr';

import fetchJson from '../libraries/fetch-json';

const MyApp = ({ Component, pageProps }: AppProps) => {
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
