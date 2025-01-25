import { useRouter } from "next/router";
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext<{
  theme: string;
  setTheme: Dispatch<SetStateAction<"system" | "light" | "dark">>;
}>({
  theme: "system",
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Router.
  const router = useRouter();

  // Theme state.
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

  // Initial theme setup
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as
      | "system"
      | "light"
      | "dark"
      | null;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    const route = router.asPath;

    // Only force light theme on auth pages and homepage
    if (route.startsWith("/auth") || route === "/") {
      document.documentElement.classList.remove("dark");
    } else {
      // For all other routes, respect the user's theme choice
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (theme === "light") {
        document.documentElement.classList.remove("dark");
      } else if (theme === "system") {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }

    // Always save theme preference
    localStorage.setItem("theme", theme);
  }, [theme, router.asPath]);

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        if (mediaQuery.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
