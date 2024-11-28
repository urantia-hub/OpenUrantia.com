// Node modules.
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";

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

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
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
    icon: (
      <svg className="w-5 h-4 fill-current" viewBox="0 0 122.88 99.45">
        <path d="M64.48.38H82.9c1.85 0 3.36 1.51 3.36 3.36v14.84H61.12V3.74c0-1.85 1.51-3.36 3.36-3.36zm21.79 27.27v45.19H61.12V27.65h25.15zm0 54.27v13.8c0 1.85-1.51 3.36-3.36 3.36H64.48c-1.85 0-3.36-1.51-3.36-3.36v-13.8h25.15zM101.09.38h18.42c1.85 0 3.36 1.51 3.36 3.36v14.84H97.73V3.74c0-1.85 1.52-3.36 3.36-3.36zm21.79 27.27v45.19H97.73V27.65h25.15zm0 54.27v13.8c0 1.85-1.51 3.36-3.36 3.36H101.1c-1.85 0-3.36-1.51-3.36-3.36v-13.8h25.14zM35.95.2l17.31 6.3c1.74.63 2.64 2.57 2.01 4.31L50.2 24.75l-23.63-8.6 5.07-13.94C32.28.47 34.22-.43 35.95.2zM47.1 33.28 31.65 75.75l-23.63-8.6 15.45-42.46 23.63 8.59zm-18.55 51-4.72 12.96c-.63 1.74-2.57 2.64-4.31 2.01l-17.31-6.3C.47 92.32-.43 90.38.2 88.64l4.72-12.96 23.63 8.6z" />
      </svg>
    ),
    name: "Bookmarks & Notes",
    path: "/my-library",
    requireAuth: true,
  },
  {
    icon: (
      <svg className="w-5 h-4 fill-current" viewBox="0 0 114.1 122.88">
        <path
          d="M75.84 27.1a35.68 35.68 0 0 1 8.61 7.09 32.45 32.45 0 0 1 5.76 9.26 36.84 36.84 0 0 1 1.85 6 34.64 34.64 0 0 1 .24 14 38.69 38.69 0 0 1-2.15 7.32l-.12.25c-2.06 5-5.59 9.86-9 14.66-1.75 2.42-3.48 4.82-4.94 7.15A4.69 4.69 0 0 1 71.73 95l-27.56 4.1A4.7 4.7 0 0 1 39 95.69a40.19 40.19 0 0 0-2.54-5.82 24.85 24.85 0 0 0-3-4.49c-1.43-1.63-2.88-3.29-4.29-5.2A40.42 40.42 0 0 1 25 73.24a41.08 41.08 0 0 1-2.81-8 35.84 35.84 0 0 1-.95-8.45A35.39 35.39 0 0 1 22.35 48a41.69 41.69 0 0 1 3.42-8.85l.2-.35a35.55 35.55 0 0 1 7.13-8.63 33.72 33.72 0 0 1 9.46-5.83l.28-.1a35.41 35.41 0 0 1 8-2.14 37.78 37.78 0 0 1 8.77-.2 39.14 39.14 0 0 1 8.4 1.71 38.44 38.44 0 0 1 7.79 3.49Zm-4 87.26a17.37 17.37 0 0 1-6.28 6.29 16.46 16.46 0 0 1-7.2 2.2A14.87 14.87 0 0 1 51 121.4a15.1 15.1 0 0 1-4.39-3.27l25.29-3.77Zm2.41-14.15v2.23a22 22 0 0 1 0 3.25l-.49 2.39-30.64 4.56-.54-1.23-1.19-4.9v-1.42l32.79-4.88ZM56.34 3.77A3.84 3.84 0 0 1 60.23 0h.27A3.84 3.84 0 0 1 64 3.89a1.27 1.27 0 0 1 0 .2l-.21 8.21a2.11 2.11 0 0 1 0 .26 3.84 3.84 0 0 1-3.87 3.54h-.27a3.84 3.84 0 0 1-3.53-3.88 1.09 1.09 0 0 1 0-.19l.2-8.25ZM14 18.15a3.84 3.84 0 0 1 2.47-6.66 3.83 3.83 0 0 1 2.76 1l6.16 5.73a3.91 3.91 0 0 1 1.22 2.68 3.82 3.82 0 0 1-1 2.76 3.86 3.86 0 0 1-2.67 1.22 3.8 3.8 0 0 1-2.76-1L14 18.15ZM3.92 60.48A3.86 3.86 0 0 1 0 56.75a3.84 3.84 0 0 1 3.73-4l8.41-.28a3.84 3.84 0 0 1 4 3.72v.2a3.84 3.84 0 0 1-3.73 3.77h-.15l-8.3.27Zm106-11.92h.08a3.84 3.84 0 0 1 2.66.86 3.81 3.81 0 0 1 1.4 2.59.49.49 0 0 1 0 .13 3.84 3.84 0 0 1-3.44 4.06l-8.37.89a3.83 3.83 0 0 1-2.81-.85 3.84 3.84 0 0 1 2-6.8c2.79-.31 5.6-.63 8.4-.9ZM93.33 15.09A3.83 3.83 0 0 1 98.65 14a3.73 3.73 0 0 1 1.63 2.44 3.84 3.84 0 0 1-.58 2.88l-4.68 7A3.8 3.8 0 0 1 92.58 28a3.88 3.88 0 0 1-2.88-.57A3.92 3.92 0 0 1 88.06 25a3.84 3.84 0 0 1 .58-2.88l4.69-7Zm-55.1 65.78A42.19 42.19 0 0 1 31 70.56 31.2 31.2 0 0 1 27.89 57a31.7 31.7 0 0 1 3.81-14.44.47.47 0 0 0 .05-.1 27.5 27.5 0 0 1 13.4-11.71 29.65 29.65 0 0 1 13.93-2A32.09 32.09 0 0 1 72.39 33 27.43 27.43 0 0 1 84 46.2a28.85 28.85 0 0 1 0 22.25C81.31 75 75.15 82 71.11 88.4a1.67 1.67 0 0 0-.67 0l-26.08 3.85a35 35 0 0 0-6.13-11.38Z"
          style={{
            fillRule: "evenodd",
          }}
        />
      </svg>
    ),
    name: "Progress",
    path: "/progress",
    requireAuth: true,
  },
  {
    icon: (
      <svg className="w-5 h-4 fill-current" viewBox="0 0 122.88 122.878">
        <path
          clipRule="evenodd"
          d="m101.589 14.7 8.818 8.819c2.321 2.321 2.321 6.118 0 8.439l-7.101 7.101a47.216 47.216 0 0 1 4.405 11.752h9.199c3.283 0 5.969 2.686 5.969 5.968V69.25c0 3.283-2.686 5.969-5.969 5.969h-10.039a47.194 47.194 0 0 1-5.204 11.418l6.512 6.51c2.321 2.323 2.321 6.12 0 8.44l-8.818 8.819c-2.321 2.32-6.119 2.32-8.439 0l-7.102-7.102a47.118 47.118 0 0 1-11.753 4.406v9.199c0 3.282-2.685 5.968-5.968 5.968h-12.47c-3.283 0-5.969-2.686-5.969-5.968V106.87a47.21 47.21 0 0 1-11.417-5.205l-6.511 6.512c-2.323 2.321-6.12 2.321-8.441 0l-8.818-8.818c-2.321-2.321-2.321-6.118 0-8.439l7.102-7.102a47.077 47.077 0 0 1-4.405-11.751H5.968C2.686 72.067 0 69.382 0 66.099V53.628c0-3.283 2.686-5.968 5.968-5.968h10.039a47.27 47.27 0 0 1 5.204-11.418l-6.511-6.51c-2.321-2.322-2.321-6.12 0-8.44l8.819-8.819c2.321-2.321 6.118-2.321 8.439 0l7.101 7.101a47.133 47.133 0 0 1 11.753-4.406V5.969C50.812 2.686 53.498 0 56.78 0h12.471c3.282 0 5.968 2.686 5.968 5.969v10.036a47.239 47.239 0 0 1 11.422 5.204l6.507-6.509c2.323-2.321 6.12-2.321 8.441 0zM61.44 36.92c13.54 0 24.519 10.98 24.519 24.519 0 13.538-10.979 24.519-24.519 24.519-13.539 0-24.519-10.98-24.519-24.519 0-13.539 10.98-24.519 24.519-24.519z"
          fillRule="evenodd"
        />
      </svg>
    ),
    name: "Settings",
    path: "/settings",
    requireAuth: true,
  },
];

export default More;
