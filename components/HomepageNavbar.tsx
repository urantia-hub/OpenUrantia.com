// Node modules.
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import LogoSymbol from "./LogoSymbol";
import { deriveReadLink } from "@/utils/readPaperLink";

const HomepageNavbar = () => {
  // Hooks.
  const { status } = useSession();

  // Router.
  const router = useRouter();

  // State.
  const [lastVisitedNode, setLastVisitedNode] =
    useState<LastVisitedNode | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const fetchLastVisitedNode = async () => {
    try {
      const response = await fetch(`/api/user/nodes/last-visited`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setLastVisitedNode(data);
      localStorage.setItem("lastVisitedNode", JSON.stringify(data));
    } catch (error) {
      console.error(`Unable to fetch last visited node`, error);

      // Fallback to local storage.
      console.warn(`Falling back to local storage for last visited node`);
      const lastVisitedNode: LastVisitedNode = localStorage.getItem(
        "lastVisitedNode"
      )
        ? JSON.parse(localStorage.getItem("lastVisitedNode") as string)
        : null;
      setLastVisitedNode(lastVisitedNode);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchLastVisitedNode();
    }
    if (status === "unauthenticated") {
      const lastVisitedNode: LastVisitedNode = localStorage.getItem(
        "lastVisitedNode"
      )
        ? JSON.parse(localStorage.getItem("lastVisitedNode") as string)
        : null;
      setLastVisitedNode(lastVisitedNode);
    }
  }, [status]);

  useEffect(() => {
    // Prevent scrolling on background content when search is open.
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isSearchOpen]);

  const onResetState = () => {
    setIsSearchOpen(false);
  };

  // Derive the Read link based on the authentication status.
  const continueReadingLink = deriveReadLink(status);

  return (
    <>
      <header className="flex flex-col items-center pt-2 pb-1 px-2 bg-transparent text-white z-10">
        <div className="flex items-center justify-between w-full max-w-5xl pt-1 pb-2 px-2">
          <Link
            className="flex-1 text-2xl text-left hover:no-underline"
            href="/"
          >
            <h1 className="flex items-center font-bold tracking-wide text-xl md:text-2xl text-white">
              <span className="flex items-center font-light">Urantia</span>
              Hub
            </h1>
          </Link>
          <LogoSymbol className="flex-1 fill-white h-6 w-6 md:h-8 md:w-8" />
          <div className="flex-1 flex justify-end text-base">
            <Link
              className="text-center hover:no-underline mr-4 md:mr-8 text-white hover:text-white/80 transition-colors duration-200"
              href={continueReadingLink}
            >
              Read
            </Link>
            {status === "authenticated" && (
              <Link
                aria-label="More options"
                className="text-center hover:no-underline mr-4 md:mr-6 text-white hover:text-white/80 transition-colors duration-200"
                href="/more"
              >
                <svg
                  className="w-6 h-6 fill-current mb-1"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 15h80v10H10zM10 45h80v10H10zM10 75h80v10H10z" />
                </svg>
              </Link>
            )}
            {status === "unauthenticated" && (
              <button
                className="border-0 p-0 bg-transparent text-right hover:no-underline text-white hover:text-white/80 transition-colors duration-200"
                onClick={() => {
                  router.push("/auth/sign-in");
                  onResetState();
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default HomepageNavbar;
