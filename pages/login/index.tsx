// Node modules.
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
// Relative modules.
import HeadTag from "@/components/HeadTag";

const Login = () => {
  // Get the router.
  const router = useRouter();

  // Get the session.
  const { status } = useSession();

  // If user is already authenticated, redirect to the /papers page.
  useEffect(() => {
    if (status === "authenticated") {
      router.push((router?.query?.callbackUrl as string) || "/papers");
    }
  }, [router, status]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black to-blue-900 items-center justify-center">
      <HeadTag
        metaDescription="Sign in to your OpenUrantia account to access your profile, create bookmarks, create notes, track your progress, and more."
        titlePrefix="Sign In"
      />

      <header className="fixed top-0 left-0 right-0 md:top-4 md:left-4 md:right-unset hidden md:block z-10 mx-auto p-2">
        <Link className="text-2xl text-left hover:no-underline" href="/">
          <span className="flex items-center font-bold tracking-wide text-2xl">
            <span className="flex items-center font-light">Open</span>
            Urantia
          </span>
        </Link>
      </header>

      <main className="flex flex-col items-center justify-center min-h-screen md:min-h-0 w-full md:w-auto p-6 rounded-md bg-zinc-800 shadow-lg shadow-black/50">
        <h1 className="font-bold tracking-wide text-3xl m-0 mb-6">
          <span className="font-light">Open</span>
          Urantia
        </h1>

        <button
          className="flex items-center justify-center bg-white text-neutral-700 rounded-md px-6 py-2 hover:bg-neutral-100 transition-all duration-300"
          onClick={() => {
            console.log(
              "router?.query?.callbackUrl",
              router?.query?.callbackUrl
            );
            signIn("google", {
              callbackUrl: (router?.query?.callbackUrl as string) || "/papers",
            });
          }}
        >
          <svg
            className="w-6 h-6 mr-2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Sign in with Google
        </button>
        <p className="text-neutral-400 text-xs mt-6">
          By signing in, you agree to the{" "}
          <Link
            href="/terms-of-service"
            className="underline text-neutral-300 hover:text-neutral-200 transition-colors duration-200"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="underline text-neutral-300 hover:text-neutral-200 transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </main>
    </div>
  );
};

export default Login;
