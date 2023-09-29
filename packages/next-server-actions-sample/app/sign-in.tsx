"use client";

import { useRouter } from "next/navigation";
import { signIn } from "../libraries/logto";

const SignIn = () => {
  const router = useRouter();

  const handleClick = async () => {
    const redirectUrl = await signIn();

    router.push(redirectUrl);
  };

  return <button onClick={handleClick}>Sign In</button>;
};

export default SignIn;
