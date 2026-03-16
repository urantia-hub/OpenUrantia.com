import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useModals } from "./useModals";

describe("useModals", () => {
  it("initializes with all modals closed", () => {
    const { result } = renderHook(() => useModals());
    expect(result.current.selectedGlobalIdExplain).toBe("");
    expect(result.current.selectedGlobalIdRelatedWorks).toBe("");
    expect(result.current.selectedGlobalIdShare).toBe("");
    expect(result.current.expandedGlobalId).toBe("");
  });

  it("opens and closes explain modal", () => {
    const { result } = renderHook(() => useModals());
    act(() => result.current.setSelectedGlobalIdExplain("1:2.0.1"));
    expect(result.current.selectedGlobalIdExplain).toBe("1:2.0.1");
    act(() => result.current.onExplainClose());
    expect(result.current.selectedGlobalIdExplain).toBe("");
  });

  it("opens and closes share modal", () => {
    const { result } = renderHook(() => useModals());
    act(() => result.current.onShareClick("1:2.0.1")());
    expect(result.current.selectedGlobalIdShare).toBe("1:2.0.1");
    act(() => result.current.onShareClose());
    expect(result.current.selectedGlobalIdShare).toBe("");
  });

  it("toggles expanded global ID", () => {
    const { result } = renderHook(() => useModals());
    // Open
    act(() => result.current.onNodeSettingsClick("1:2.0.1")());
    expect(result.current.expandedGlobalId).toBe("1:2.0.1");
    // Toggle closed
    act(() => result.current.onNodeSettingsClick("1:2.0.1")());
    expect(result.current.expandedGlobalId).toBe("");
  });

  it("onlyOpen mode does not toggle closed", () => {
    const { result } = renderHook(() => useModals());
    act(() => result.current.onNodeSettingsClick("1:2.0.1", { onlyOpen: true })());
    expect(result.current.expandedGlobalId).toBe("1:2.0.1");
    // Calling again with onlyOpen should keep it open
    act(() => result.current.onNodeSettingsClick("1:2.0.1", { onlyOpen: true })());
    expect(result.current.expandedGlobalId).toBe("1:2.0.1");
  });
});
