// Node modules.
import { useEffect, useState } from "react";

type NavbarProps = {
  fontSize: "small" | "medium" | "large";
  setFontSize: (fontSize: "small" | "medium" | "large") => void;
};

const TopReadingNavbar = ({ fontSize, setFontSize }: NavbarProps) => {
  // Hidden state.
  const [hidden, setHidden] = useState<boolean>(false);

  // Hide the Navbar on scroll down and show it on scroll up.
  useEffect(() => {
    let lastScrollTop = 0;
    const handleScroll = () => {
      const currentScrollTop =
        window.scrollY || document.documentElement.scrollTop;

      if (currentScrollTop > lastScrollTop) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`flex items-center justify-center py-1 px-2 fixed top-0 left-0 right-0 z-10 bg-white dark:bg-neutral-800 dark:border-t dark:border-neutral-700 mx-auto dark:shadow-none shadow ${
        hidden ? "-translate-y-14" : "translate-y-0"
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="max-w-3xl px-4 w-full flex items-baseline justify-end">
        {/* Small */}
        <button
          aria-label="Small font size"
          className={`px-1.5 bg-transparent border-0 text-xs text-center ${
            fontSize === "small"
              ? "text-gray-600 dark:text-white underline"
              : "text-gray-400 dark:text-gray-400"
          } focus:outline-0`}
          onClick={() => setFontSize("small")}
        >
          A
        </button>
        {/* Medium */}
        <button
          aria-label="Medium font size"
          className={`px-1.5 bg-transparent border-0 text-sm text-center ${
            fontSize === "medium"
              ? "text-gray-600 dark:text-white underline"
              : "text-gray-400 dark:text-gray-400"
          } focus:outline-0`}
          onClick={() => setFontSize("medium")}
        >
          A
        </button>
        {/* Large */}
        <button
          aria-label="Large font size"
          className={`px-1.5 bg-transparent border-0 text-base text-center ${
            fontSize === "large"
              ? "text-gray-600 dark:text-white underline"
              : "text-gray-400 dark:text-gray-400"
          } focus:outline-0`}
          onClick={() => setFontSize("large")}
        >
          A
        </button>
      </div>
    </div>
  );
};

export default TopReadingNavbar;
