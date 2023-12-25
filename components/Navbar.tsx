// Node modules.
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
// Relative modules.
import LogoText from "@/components/LogoText";
import Search from "@/components/Search";

const Navbar = () => {
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
      <header
        className={`mx-auto flex justify-between items-center px-4 border-b z-10 fixed top-0 w-full transition-all duration-500 ease-in-out ${
          isScrolled
            ? `py-3 bg-black/90 scale-90`
            : `py-6 ${
                isMenuOpen ? "bg-black/90" : "bg-transparent border-zinc-700"
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
          <div className="border-b border-zinc-700 flex flex-col items-center absolute top-full left-0 w-full bg-black/90 text-xl w-full text-center pb-3">
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
                Find a paper to read
              </Link>
            </div>

            {session && (
              <>
                <div className="py-3 w-full">
                  <Link href="/activity" onClick={onResetState}>
                    Saved Quotes & Notes
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
