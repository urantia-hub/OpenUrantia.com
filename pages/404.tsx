// pages/404.js
import Link from "next/link";
import HeadTag from "@/components/HeadTag";

const Custom404 = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black to-blue-900 items-center justify-center text-white">
      <HeadTag titlePrefix="Page Not Found" />

      <header className="fixed top-0 left-0 right-0 md:top-4 md:left-6 md:right-unset hidden md:block z-10 mx-auto p-2">
        <Link className="text-2xl text-left hover:no-underline" href="/">
          <span className="flex items-center font-bold tracking-wide text-2xl">
            <span className="flex items-center font-light">Open</span>
            Urantia
          </span>
        </Link>
      </header>

      <main className="text-center p-6 rounded-md bg-zinc-800 shadow-lg shadow-black/50">
        <h1 className="font-bold text-5xl mb-4">404</h1>
        <p className="font-semibold text-2xl mb-4">Page Not Found</p>
        <p className="text-neutral-400 mb-6">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          className="inline-block bg-blue-500 text-white rounded-md px-6 py-2 hover:bg-blue-600 transition-all duration-300"
          href="/"
        >
          Go Home
        </Link>
      </main>
    </div>
  );
};

export default Custom404;
