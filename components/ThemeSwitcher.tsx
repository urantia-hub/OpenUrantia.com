import { useTheme } from "@/context/theme";

const ThemeSwitcher = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: "system" | "dark" | "light") => {
    setTheme(newTheme);
  };

  return (
    <select
      className={className || ""}
      onChange={(event) =>
        handleThemeChange(event.target.value as "system" | "dark" | "light")
      }
      value={theme}
    >
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
};

export default ThemeSwitcher;
