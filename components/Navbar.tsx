// Node modules.
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
// Relative modules.
import PaperNavbar from "@/components/PaperNavbar";
import { deriveReadLink } from "@/utils/readPaperLink";

type NavbarProps = {
  audioContent?: JSX.Element;
  audioOnPlay?: () => void;
  paperId?: number;
  paperTitle?: string;
  showAudio?: boolean;
};

const Navbar = ({
  audioContent,
  audioOnPlay,
  paperId,
  paperTitle,
  showAudio,
}: NavbarProps) => {
  // Hooks.
  const router = useRouter();
  const { status } = useSession();

  // Derive the Read link based on the authentication status.
  const continueReadingLink = deriveReadLink(status);

  return (
    <>
      <header className="flex flex-col items-center pt-2 pb-1 px-2 fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-neutral-800 dark:border-t dark:border-neutral-700 mx-auto dark:shadow-none shadow">
        <PaperNavbar
          audioContent={audioContent}
          audioOnPlay={audioOnPlay}
          paperId={paperId}
          paperTitle={paperTitle}
          showAudio={showAudio}
        />

        <div className="flex items-center justify-around w-full max-w-sm pt-1 pb-2">
          <Link
            className={`flex-1 flex flex-col items-center text-xs text-center ${
              router.asPath === "/papers"
                ? "text-gray-600 dark:text-white"
                : "text-gray-400 dark:text-gray-400"
            } line-clamp-1 hover:text-gray-600 hover:dark:text-white hover:no-underline transition duration-300 ease-in-out`}
            href="/papers"
          >
            <svg
              className="w-6 h-6 fill-current mb-1"
              viewBox="0 0 64 64"
              xmlSpace="preserve"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M56.4 62.3H43.3c-3.2 0-5.9-2.6-5.9-5.9V45.8c0-.8-.6-1.4-1.4-1.4h-8c-.8 0-1.4.6-1.4 1.4v10.6c0 3.3-2.6 5.9-5.9 5.9H7.6c-3.2 0-5.9-2.6-5.9-5.9V22.7c0-1.7.8-3.2 2.2-4.1L29.4 2.5c1.6-1 3.6-1 5.1 0L60 18.7c1.4.9 2.2 2.4 2.2 4.1v33.6c.1 3.2-2.6 5.9-5.8 5.9zM28 39.9h8c3.3 0 5.9 2.6 5.9 5.9v10.6c0 .8.6 1.4 1.4 1.4h13.1c.8 0 1.4-.6 1.4-1.4V22.7c0-.1-.1-.2-.1-.3L32.1 6.3c-.1-.1-.2-.1-.3 0L6.4 22.4c-.1.1-.2.2-.2.3v33.7c0 .8.6 1.4 1.4 1.4h13.1c.8 0 1.4-.6 1.4-1.4V45.8c0-3.2 2.6-5.9 5.9-5.9z" />
            </svg>
            Home
          </Link>
          <Link
            className={`flex-1 flex flex-col items-center text-xs text-center ${
              router.asPath.startsWith("/papers/")
                ? "text-gray-600 dark:text-white"
                : "text-gray-400 dark:text-gray-400"
            } line-clamp-1 hover:text-gray-600 hover:dark:text-white hover:no-underline transition duration-300 ease-in-out`}
            href={continueReadingLink}
            onClick={(event) => {
              // Prevent the default behavior if the user is already on the Read page.
              if (router.asPath.startsWith("/papers/")) event.preventDefault();
            }}
          >
            <svg
              className="w-6 h-6 fill-current mb-1"
              viewBox="0 0 122.88 101.37"
            >
              <path d="m12.64 77.27.31-54.92h-6.2v69.88c8.52-2.2 17.07-3.6 25.68-3.66 7.95-.05 15.9 1.06 23.87 3.76a50.968 50.968 0 0 0-16.36-8.88c-7.42-2.42-15.44-3.22-23.66-2.52a3.38 3.38 0 0 1-3.64-3.08c-.02-.2-.02-.39 0-.58zm90.98-57.79c-.02-.16-.04-.33-.04-.51 0-.17.01-.34.04-.51V7.34c-7.8-.74-15.84.12-22.86 2.78-6.56 2.49-12.22 6.58-15.9 12.44V85.9c5.72-3.82 11.57-6.96 17.58-9.1 6.85-2.44 13.89-3.6 21.18-3.02v-54.3zm6.75-3.88h9.14c1.86 0 3.37 1.51 3.37 3.37v77.66a3.372 3.372 0 0 1-4.46 3.19c-9.4-2.69-18.74-4.48-27.99-4.54-9.02-.06-18.03 1.53-27.08 5.52-.56.37-1.23.57-1.92.56-.68.01-1.35-.19-1.92-.56-9.04-4-18.06-5.58-27.08-5.52-9.25.06-18.58 1.85-27.99 4.54-.34.12-.71.18-1.09.18-1.84.01-3.35-1.5-3.35-3.36V18.97c0-1.86 1.51-3.37 3.37-3.37h9.61l.06-11.26a3.366 3.366 0 0 1 2.68-3.28c8.87-1.85 19.65-1.39 29.1 2.23 6.53 2.5 12.46 6.49 16.79 12.25 4.37-5.37 10.21-9.23 16.78-11.72 8.98-3.41 19.34-4.23 29.09-2.8 1.68.24 2.88 1.69 2.88 3.33V15.6h.01zM68.13 91.82c7.45-2.34 14.89-3.3 22.33-3.26 8.61.05 17.16 1.46 25.68 3.66V22.35h-5.77v55.22a3.372 3.372 0 0 1-4.15 3.28c-7.38-1.16-14.53-.2-21.51 2.29-5.62 2.01-11.14 5.01-16.58 8.68zm-10.01-6.57V22.46c-3.53-6.23-9.24-10.4-15.69-12.87-7.31-2.8-15.52-3.43-22.68-2.41l-.38 66.81c7.81-.28 15.45.71 22.64 3.06a57.689 57.689 0 0 1 16.11 8.2z" />
            </svg>
            Read
          </Link>
          <Link
            className={`flex-1 flex flex-col items-center text-xs text-center ${
              router.asPath.startsWith("/search")
                ? "text-gray-600 dark:text-white"
                : "text-gray-400 dark:text-gray-400"
            } line-clamp-1 hover:text-gray-600 hover:dark:text-white hover:no-underline transition duration-300 ease-in-out`}
            href="/search"
          >
            <svg
              className="w-6 h-6 fill-current mb-1"
              viewBox="0 0 119.828 122.88"
            >
              <path d="M48.319 0C61.662 0 73.74 5.408 82.484 14.152s14.152 20.823 14.152 34.166c0 12.809-4.984 24.451-13.117 33.098.148.109.291.23.426.364l34.785 34.737a3.723 3.723 0 0 1-5.25 5.28L78.695 87.06a3.769 3.769 0 0 1-.563-.715 48.116 48.116 0 0 1-29.814 10.292c-13.343 0-25.423-5.408-34.167-14.152C5.408 73.741 0 61.661 0 48.318s5.408-25.422 14.152-34.166C22.896 5.409 34.976 0 48.319 0zm28.763 19.555c-7.361-7.361-17.53-11.914-28.763-11.914s-21.403 4.553-28.764 11.914c-7.361 7.361-11.914 17.53-11.914 28.763s4.553 21.403 11.914 28.764c7.36 7.361 17.53 11.914 28.764 11.914 11.233 0 21.402-4.553 28.763-11.914 7.361-7.36 11.914-17.53 11.914-28.764 0-11.233-4.553-21.402-11.914-28.763z" />
            </svg>
            Search
          </Link>
          {status === "unauthenticated" && (
            <button
              className="flex-1 flex flex-col border-0 dark:border-0 items-center p-0 dark:p-0 text-xs text-center text-gray-500 hover:text-gray-600 dark:text-gray-400 hover:dark:text-white bg-transparent line-clamp-1 hover:no-underline transition duration-300 ease-in-out focus:outline-none"
              onClick={() => {
                router.push("/auth/sign-in");
              }}
            >
              <svg
                className="w-6 h-6 fill-current mb-1"
                viewBox="0 0 113.055 122.88"
              >
                <path d="M53.114 2.457C53.114 1.1 54.643 0 56.527 0s3.413 1.1 3.413 2.457v44.377c0 1.357-1.528 2.457-3.413 2.457s-3.413-1.1-3.413-2.457V2.457zm20.501 17.204a3.406 3.406 0 0 1-2.026-4.373 3.406 3.406 0 0 1 4.372-2.026c10.962 4.015 20.339 11.339 26.924 20.766a56.262 56.262 0 0 1 10.17 32.325c0 15.606-6.329 29.738-16.559 39.969-10.23 10.229-24.362 16.559-39.969 16.559s-29.739-6.329-39.969-16.559C6.329 96.091 0 81.959 0 66.353a56.261 56.261 0 0 1 10.169-32.325c6.585-9.427 15.962-16.751 26.924-20.766a3.408 3.408 0 0 1 2.346 6.399A49.88 49.88 0 0 0 15.741 37.92c-5.619 8.044-8.916 17.846-8.916 28.433 0 13.723 5.564 26.148 14.559 35.143 8.995 8.995 21.42 14.56 35.143 14.56s26.148-5.564 35.143-14.56c8.995-8.994 14.559-21.42 14.559-35.143 0-10.587-3.297-20.389-8.916-28.433a49.873 49.873 0 0 0-23.698-18.259z" />
              </svg>
              Sign In
            </button>
          )}
          {status !== "unauthenticated" && (
            <>
              <Link
                className={`flex-1 flex flex-col items-center text-xs text-center ${
                  router.asPath.startsWith("/more")
                    ? "text-gray-600 dark:text-white"
                    : "text-gray-400 dark:text-gray-400"
                } hover:text-gray-600 hover:dark:text-white line-clamp-1 hover:no-underline transition duration-300 ease-in-out`}
                href="/more"
              >
                <svg
                  className="w-6 h-6 fill-current mb-1"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 15h80v10H10zM10 45h80v10H10zM10 75h80v10H10z" />
                </svg>
                More
              </Link>
            </>
          )}
        </div>
      </header>
    </>
  );
};

export default Navbar;
