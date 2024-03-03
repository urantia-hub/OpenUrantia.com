// Sign Out Page
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import HeadTag from "@/components/HeadTag";
import Link from "next/link";

const SignOutPage = () => {
  useEffect(() => {
    // Perform the sign out
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black to-blue-900 items-center justify-center">
      <HeadTag titlePrefix="Sign Out" />

      <header className="fixed top-0 left-0 right-0 md:top-4 md:left-6 md:right-unset hidden md:block z-10 mx-auto p-2">
        <Link className="text-2xl text-left hover:no-underline" href="/">
          <span className="flex items-center font-bold tracking-wide text-2xl">
            <span className="flex items-center font-light">Open</span>
            Urantia
          </span>
        </Link>
      </header>

      <main className="flex flex-col items-center justify-center min-h-screen md:min-h-0 w-full md:w-auto p-6 rounded-md bg-zinc-800 shadow-lg shadow-black/50">
        <h1 className="font-bold text-3xl text-white mb-4 text-center">
          Signing Out...
        </h1>
        <p className="text-neutral-400 text-center">
          You are being signed out. This should only take a moment.
        </p>
      </main>
    </div>
  );
};

export default SignOutPage;
