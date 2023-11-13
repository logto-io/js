"use client";

import { useRouter } from "next/navigation";
import { handleSignIn } from "../../libraries/logto";
import { useEffect } from "react";

type Props = {
  readonly searchParams: Record<string, string>;
};

export default function Callback({ searchParams }: Props) {
  const router = useRouter();

  useEffect(() => {
    handleSignIn(searchParams).then(() => {
      router.push("/");
    });
  }, [router, searchParams]);

  return <div>Signing in...</div>;
}
