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
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system"); // Default to system theme

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

  useEffect(() => {
    if (theme === "system") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList[theme === "dark" ? "add" : "remove"](
        "dark"
      );
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const route = router.asPath;

    // If the route starts with /auth or is the homepage, set the theme to light
    if (route.startsWith("/auth") || route === "/") {
      setTheme("light");
    } else {
      // Else, use the theme from localStorage or system preference
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
    }
  }, [router.asPath]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
