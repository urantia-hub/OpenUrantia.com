import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import { useRouter } from "next/router";

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    // Redirect to profile page and make sure they can't navigate back to login page.
    router.replace("/profile");
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-800">
      <HeadTag titlePrefix="Login" />
      <Navbar />

      <main className="mt-28 flex flex-col flex-grow justify-center items-center px-4 my-4">
        {session ? (
          <>
            <p className="text-base mt-2 text-center">
              Welcome, {session.user?.email}
            </p>
            <Link href="/profile">
              <a className="text-xl hover:text-gray-300">Go to Profile</a>
            </Link>
          </>
        ) : (
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 px-6 pt-8 pb-6 rounded shadow-md mx-auto max-w-sm mt-10 flex flex-col items-center w-full">
            <h1 className="mb-8 text-3xl text-white text-center">
              Sign In or Register
            </h1>
            <button
              onClick={() => signIn("google")}
              className="w-full text-center py-2 px-4 rounded bg-white text-black mb-3 hover:bg-gray-200"
            >
              Continue with Google
            </button>
            {/* <hr className="my-4 border-gray-700 w-full" />
            <p className="text-center text-white mb-4 text-sm">Or</p>
            <button
              onClick={() => signIn("google")}
              className="w-full text-center py-2 px-4 rounded bg-white text-black mb-3 hover:bg-gray-200"
            >
              Continue with Google
            </button>
            <button
              onClick={() => signIn("facebook")}
              className="w-full text-center py-2 px-4 rounded bg-white text-black mb-3 hover:bg-gray-200"
            >
              Continue with Facebook
            </button> */}
            <Link
              href="/register"
              className="text-center text-white text-sm hover:underline mt-2"
            >
              Don&apos;t have an account? Sign up here.
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
