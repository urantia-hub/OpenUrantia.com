// Node modules.
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
// Relative modules.
import LogoText from "@/components/LogoText";

const Navbar = () => {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`mx-auto flex justify-between items-center px-4 border-b z-10 fixed top-0 w-full transition-all duration-500 ease-in-out ${
        isScrolled
          ? "py-3 bg-black bg-opacity-80 border-transparent scale-90"
          : "py-6 bg-transparent border-zinc-700"
      }`}
      // `style` here is counteracting the scaling down when scrolled.
      style={{
        transformOrigin: "top",
        width: isScrolled ? "calc(100% / 0.9)" : "100%",
        marginLeft: isScrolled ? "calc(-50vw * (1 - 0.9) / 2)" : "0",
      }}
    >
      <div className="container mx-auto flex items-center justify-between transform transition-transform duration-500 ease-in-out">
        <Link href="/" className="no-underline hover:no-underline">
          <LogoText />
        </Link>
        <div className="flex items-center">
          <Link href="/read" className="mr-6">
            Read
          </Link>
          {session ? (
            <>
              <Link href="/profile" className="mr-6">
                Profile
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
      </div>
    </header>
  );
};

export default Navbar;
