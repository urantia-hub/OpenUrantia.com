import { useState, useEffect } from "react";

type FontSize = "small" | "medium" | "large";

export function useFontSize() {
  const [fontSize, setFontSize] = useState<FontSize>("medium");

  // Load from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem("fontSize") as FontSize;
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
  }, []);

  const updateFontSize = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem("fontSize", size);
  };

  const getFontSizeClasses = () => {
    switch (fontSize) {
      case "small":
        return "text-sm/6 md:text-base/7";
      case "large":
        return "text-lg/8 md:text-xl/9";
      default:
        return "text-base/7 md:text-lg/8";
    }
  };

  return { fontSize, updateFontSize, getFontSizeClasses };
}
