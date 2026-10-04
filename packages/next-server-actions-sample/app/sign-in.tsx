'use client';

type Props = {
  onSignIn: () => Promise<void>;
};

const SignIn = ({ onSignIn }: Props) => {
  return (
    <button
      onClick={() => {
        onSignIn();
      }}
    >
      Sign In
    </button>
  );
};

export default SignIn;
