'use client';

type Props = {
  readonly isAuthenticated: boolean;
};

const Nav = ({ isAuthenticated }: Props) => {
  return (
    <nav>
      {isAuthenticated ? (
        <button
          onClick={() => {
            window.location.assign('/api/logto/sign-out');
          }}
        >
          Sign Out
        </button>
      ) : (
        <button
          onClick={() => {
            window.location.assign('/api/logto/sign-in');
          }}
        >
          Sign In
        </button>
      )}
    </nav>
  );
};

export default Nav;
