// Node modules.
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const HomepageNavbar = () => {
  // Hooks.
  const { status } = useSession();

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

  return (
    <>
      <header className="flex flex-col items-center pt-2 pb-1 px-2 fixed top-0 left-0 right-0 z-10 mx-auto bg-gradient-to-b from-black to-transparent backdrop-filter backdrop-blur-sm">
        <div className="flex items-center justify-between w-full max-w-5xl pt-1 pb-2">
          <Link className="text-2xl text-left hover:no-underline" href="/">
            <h1 className="flex items-center font-bold tracking-wide text-base md:text-2xl">
              <span className="flex items-center font-light">Open</span>
              Urantia
            </h1>
          </Link>
          <div className="flex justify-end text-sm md:text-base">
            <Link
              className="text-center hover:no-underline mr-4 md:mr-6 text-gray-200 hover:text-white transition-colors duration-200"
              href={
                status === "authenticated" && lastVisitedNode
                  ? `/papers/${lastVisitedNode.paperId}#${lastVisitedNode.globalId}`
                  : "/papers"
              }
            >
              Read
            </Link>
            {status === "authenticated" ? (
              <button
                className="border-0 p-0 bg-transparent text-right hover:no-underline text-gray-200 hover:text-red-300 transition-colors duration-200"
                onClick={() => {
                  signOut();
                  onResetState();
                }}
              >
                Sign Out
              </button>
            ) : (
              <button
                className="border-0 p-0 bg-transparent text-right hover:no-underline text-gray-200 hover:text-white transition-colors duration-200"
                onClick={() => {
                  signIn("google", { callbackUrl: "/papers" });
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
