// Node modules.
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import { Library, Bookmark, Lightbulb, Settings } from "lucide-react";

const More = () => {
  // Hooks.
  const { status } = useSession();

  const router = useRouter();

  if (status === "unauthenticated") {
    router.replace("/auth/sign-in");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        metaDescription="Discover additional resources and information on UrantiaHub, expanding your understanding of The Urantia Papers and our community."
        titlePrefix="More"
      />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content min-h-screen">
        <h1 className="text-2xl md:text-4xl dark:text-white font-bold mb-8 text-center">
          More
        </h1>
        <div className="flex flex-col w-full">
          {moreRoutes.map((route) => {
            if (route.requireAuth && status !== "authenticated") {
              return null;
            }

            return (
              <Link
                className="flex flex-row items-center justify-start w-full py-3 px-4 rounded-lg text-gray-600 bg-white dark:text-white dark:bg-zinc-900 hover:dark:bg-zinc-950 hover:no-underline transition-all duration-300 ease-in-out mb-4 hover:shadow-lg"
                href={route.path}
                key={route.path}
              >
                <div className="flex flex-row items-center justify-center h-8 w-8 rounded-lg bg-slate-200 dark:bg-zinc-700 text-gray-600 dark:text-white mr-3">
                  {route.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg">{route.name}</span>
                </div>
              </Link>
            );
          })}
          {status === "authenticated" && (
            <button
              className="border-0 dark:border-0 text-center text-lg w-full p-3 rounded-lg text-gray-600 bg-white dark:text-white dark:bg-zinc-900 hover:dark:bg-zinc-950 hover:no-underline transition-all duration-300 ease-in-out mb-4 hover:shadow-lg"
              onClick={() => signOut()}
              type="button"
            >
              Sign Out
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const moreRoutes = [
  {
    icon: <Bookmark className="w-5 h-5" />,
    name: "Bookmarks",
    path: "/my-library/bookmarks",
    requireAuth: true,
  },
  {
    icon: <Library className="w-5 h-5" />,
    name: "My Library",
    path: "/my-library",
    requireAuth: true,
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    name: "Progress",
    path: "/progress",
    requireAuth: true,
  },
  {
    icon: <Settings className="w-5 h-5" />,
    name: "Settings",
    path: "/settings",
    requireAuth: true,
  },
];

export default More;
