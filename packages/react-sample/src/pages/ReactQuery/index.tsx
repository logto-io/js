import { useLogto } from '@logto/react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { endpoint } from '../../consts';

/**
 * A custom hook that returns a fetcher function that automatically adds the access token to the
 * request. It uses `fetch` under the hood, and has the same signature.
 */
const useApi = () => {
  const { getAccessToken } = useLogto();
  const fetcher: typeof fetch = async (input, init) => {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error('No access token available.');
    }

    const response = await fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response;
  };

  return fetcher;
};

const queryClient = new QueryClient();

const ReactQuery = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Content />
    </QueryClientProvider>
  );
};

const Content = () => {
  const api = useApi();
  const query = useQuery({
    queryKey: ['userinfo'],
    queryFn: async () => {
      const response = await api(new URL('/oidc/me', endpoint));
      return response.json();
    },
  });

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return (
      <div>
        <h1>Error</h1>
        <p>{JSON.stringify(query.error)}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Success</h1>
      <p>You are seeing this page because react-query successfully fetched the user info.</p>
      <p>{JSON.stringify(query.data)}</p>
    </div>
  );
};

export default ReactQuery;
