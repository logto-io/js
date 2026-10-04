'use client';

type Props = {
  onSignOut: () => Promise<void>;
};

const SignOut = ({ onSignOut }: Props) => {
  return (
    <button
      onClick={() => {
        onSignOut();
      }}
    >
      Sign Out
    </button>
  );
};

export default SignOut;
