import Link from 'next/link';

const Home = () => {
  return (
    <div>
      Hello Logto.{' '}
      <Link href="/api/sign-in">
        <a>Sign In</a>
      </Link>
    </div>
  );
};

export default Home;
