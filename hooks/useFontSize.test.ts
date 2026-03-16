import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useFontSize } from "./useFontSize";

describe("useFontSize", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to medium", () => {
    const { result } = renderHook(() => useFontSize());
    expect(result.current.fontSize).toBe("medium");
  });

  it("loads saved font size from localStorage", () => {
    localStorage.setItem("fontSize", "large");
    const { result } = renderHook(() => useFontSize());
    expect(result.current.fontSize).toBe("large");
  });

  it("updates font size and persists to localStorage", () => {
    const { result } = renderHook(() => useFontSize());
    act(() => {
      result.current.updateFontSize("small");
    });
    expect(result.current.fontSize).toBe("small");
    expect(localStorage.getItem("fontSize")).toBe("small");
  });

  it("returns correct CSS classes for each size", () => {
    const { result } = renderHook(() => useFontSize());

    expect(result.current.getFontSizeClasses()).toBe("text-base/7 md:text-lg/8");

    act(() => result.current.updateFontSize("small"));
    expect(result.current.getFontSizeClasses()).toBe("text-sm/6 md:text-base/7");

    act(() => result.current.updateFontSize("large"));
    expect(result.current.getFontSizeClasses()).toBe("text-lg/8 md:text-xl/9");
  });
});
