"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Icons } from "@/public/assets";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { Activity } from "lucide-react";
import { useCallback, useState } from "react";
import { auth } from "@/firebase.config";
import { useRouter } from "next/navigation";

export default function LogInPage() {
  return (
    <main className="h-full min-h-[100svh] flex items-center justify-center px-4">
      {/* <div className="w-full flex items-center justify-center"> */}
      <LogInButton />
      {/* </div> */}
    </main>
  );
}

function LogInButton() {
  const [logingIn, setLogingIn] = useState(false);
  const router = useRouter();

  const logInWithGoogle = async () => {
    try {
      console.log("Signing in");
      setLogingIn(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/home");
    } catch (e) {
      console.error(`Error: ${e}`);
    } finally {
      setLogingIn(false);
    }
  };

  return (
    <button
      onClick={logInWithGoogle}
      disabled={logingIn}
        className="flex items-center justify-center gap-2 border-2 w-full max-w-xl h-16 rounded-full border-[#eee] disabled:bg-[#eee] disabled:text-black/50 cursor-pointer disabled:cursor-not-allowed hover:bg-[#eee]"
    //   className="border border-[#eee] w-full max-w-xl h-16 flex items-center justify-center gap-2 relative rounded-full cursor-pointer hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:bg-[var(--surface)] disabled:border-transparent disabled:text-gray-500"
    >
      {logingIn ? (
        <Icon icon={Icons.loading} className="text-4xl" />
      ) : (
        <>
          <Icon icon={Icons.googleG} className="text-4xl" />
          <p className="text-xl font-semibold">Continue with Google</p>
        </>
      )}
    </button>
  );
}

export function Header() {
  return (
    <header className="w-full fixed inset-0 py-4 px-4 h-fit">
      <Link href="/" className="font-bold flex items-center gap-2">
        <Activity />
        <p className="font-bold text-xl">BioTune</p>
      </Link>
    </header>
  );
}
