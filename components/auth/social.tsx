"use client";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { useSearchParams } from "next/navigation";

export const Social = () => {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  const onClick = async (provider: "google" | "github") => {
    signIn(provider, {
      callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT
    })
  }
  return (
    <div className="flex items-center w-full gap-y-2">
      <Button onClick= {() => onClick("google") } className="w-full" size="lg" variant="outline"> 
        <FcGoogle className="h-5 w-5" />
      </Button>
      <Button onClick= {() => onClick("github") } className="w-full" size="lg" variant="outline">
        <FaGithub className="h-5 w-5" />
      </Button>
    </div>
  );
};
