import Link from 'next/link';
// eslint-disable-next-line import/no-named-as-default
import Router from 'next/router';
import { useEffect } from 'react';
import useSWR from 'swr';

const Protected = () => {
  const { data, error } = useSWR<{ data: string }, Error>('/api/protected-resource');

  useEffect(() => {
    if (error?.message === 'Unauthorized') {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      void Router.push('/api/logto/sign-in');
    }
  }, [error]);

  return (
    <div>
      <header>
        <h1>Hello Logto.</h1>
      </header>
      <nav>
        <Link href="/">Go Home</Link>
      </nav>
      {data && (
        <div>
          <h2>Protected resource:</h2>
          <div>{data.data}</div>
        </div>
      )}
    </div>
  );
};

export default Protected;
