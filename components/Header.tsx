// Node modules.
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="container mx-auto flex justify-between items-center py-6 px-4 border-b border-zinc-700 z-10">
      <Link href="/" className="no-underline hover:no-underline">
        <h1 className="text-3xl font-bold tracking-wider">
          <span className="font-thin">Open</span>Urantia
        </h1>
      </Link>
      <div className="flex items-center">
        {session ? (
          <>
            <Link href="/profile" className="mr-6">
              Go to Profile
            </Link>
            <button
              onClick={() => signOut()}
              className="mr-6 bg-red-800 text-white py-1.5 px-4 rounded-full shadow-lg hover:bg-red-600 transition duration-300 ease-in-out"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="mr-6 bg-white text-black py-1.5 px-4 rounded-full shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
