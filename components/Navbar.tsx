// Node modules.
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
// Relative modules.
import LogoText from "@/components/LogoText";
import Search from "@/components/Search";

type NavbarProps = {
  paperId?: number;
  paperTitle?: string;
};

const Navbar = ({ paperId, paperTitle }: NavbarProps) => {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Prevent scrolling on background content when search is open.
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isSearchOpen]);

  const onResetState = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  return (
    <>
      {paperId !== undefined && paperTitle && (
        <div className="flex justify-between pt-3 pb-4 px-2 fixed bottom-0 left-0 right-0 z-10 bg-neutral-800 border-t border-neutral-700">
          <div className="flex-1 flex items-center justify-between bg-neutral-700 rounded-full mx-auto max-w-3xl">
            <Link
              className="px-2 py-2 hover:text-white transition duration-300 ease-in-out"
              href={`/papers/${paperId - 1 === -1 ? "0" : paperId - 1}`}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                />
              </svg>
            </Link>
            <Link
              className="flex-1 py-2 text-sm font-bold text-center line-clamp-1 hover:text-white hover:no-underline transition duration-300 ease-in-out"
              href="/read"
            >
              {paperId > 0 ? `Paper ${paperId} - ${paperTitle}` : "Foreword"}
            </Link>
            <Link
              className="px-2 py-2 flex text-right justify-end hover:text-white transition duration-300 ease-in-out"
              href={`/papers/${paperId + 1 <= 196 ? paperId + 1 : "196"}`}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}
      <header
        className={`mx-auto flex justify-between items-center px-4 border-b z-10 fixed top-0 w-full transition-all duration-500 ease-in-out ${
          isScrolled
            ? `py-3 bg-neutral-800 scale-90`
            : `py-6 ${
                isMenuOpen
                  ? "bg-neutral-800"
                  : "bg-transparent border-neutral-700"
              }`
        }`}
        // `style` here is counteracting the scaling down when scrolled.
        style={{
          transformOrigin: "top",
          width: isScrolled ? "calc(100% / 0.9)" : "100%",
          marginLeft: isScrolled ? "calc(-50vw * (1 - 0.78) / 2)" : "0",
        }}
      >
        <div className="container mx-auto flex items-center justify-between transform transition-transform duration-500 ease-in-out">
          <div className="flex items-center flex-1">
            <Link href="/" className="no-underline hover:no-underline">
              <LogoText />
            </Link>
          </div>

          <div className="flex items-center justify-end flex-1">
            {!session && (
              <button
                className="text-black bg-white rounded-full px-4 py-2 mr-2 hover:bg-blue-100 focus:outline-none transition-all duration-500 ease-in-out"
                onClick={() => {
                  signIn("google");
                  onResetState();
                }}
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="border-0 bg-transparent text-white focus:outline-none p-0"
            >
              <svg
                className="w-9 h-9 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z"
                />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-b border-neutral-700 flex flex-col items-center absolute top-full left-0 w-full bg-neutral-800 text-xl w-full text-center pb-3">
            <div className="py-3 w-full">
              <button
                className="text-white border-0 bg-transparent hover:underline focus:outline-none p-0 m-0 w-full"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                Search
              </button>
            </div>

            <div className="py-3 w-full">
              <Link href="/read" onClick={onResetState}>
                Discover Papers
              </Link>
            </div>

            {session && (
              <>
                <div className="py-3 w-full">
                  <Link href="/activity" onClick={onResetState}>
                    Quotes and Comments
                  </Link>
                </div>
                <div className="py-3 w-full">
                  <Link href="/profile" onClick={onResetState}>
                    Progress
                  </Link>
                </div>
                <div className="py-3 w-full">
                  <button
                    className="text-rose-500 border-0 bg-transparent hover:text-rose-600 hover:underline focus:outline-none p-0 m-0 w-full"
                    onClick={() => {
                      signOut();
                      onResetState();
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {isSearchOpen && <Search onClose={onResetState} />}
    </>
  );
};

export default Navbar;
