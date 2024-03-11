// pages/404.js
import Link from "next/link";
import HeadTag from "@/components/HeadTag";

const Custom404 = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-gray-600 dark:text-white">
      <HeadTag titlePrefix="Page Not Found" />

      <header className="fixed top-0 left-0 right-0 md:top-4 md:left-6 md:right-unset hidden md:block z-10 mx-auto p-2">
        <Link className="text-2xl text-left hover:no-underline" href="/">
          <span className="flex items-center font-bold tracking-wide text-2xl text-gray-600">
            <span className="flex items-center font-light">Open</span>
            Urantia
          </span>
        </Link>
      </header>

      <main className="flex flex-col items-center justify-center min-h-screen md:min-h-0 w-full md:w-auto p-6 rounded bg-white shadow-lg">
        <h1 className="font-bold text-2xl mb-2 text-gray-600">
          404: Page Not Found
        </h1>
        <p className="text-gray-400 mb-4">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          className="py-2 px-3 border-0 text-center rounded bg-blue-400 hover:bg-blue-500 hover:no-underline transition-colors duration-300 ease-in-out"
          href="/"
        >
          Go Home
        </Link>
      </main>
    </div>
  );
};

export default Custom404;
