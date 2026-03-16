import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useNotes } from "./useNotes";

describe("useNotes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not fetch notes when unauthenticated", () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    renderHook(() => useNotes("1", "unauthenticated"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches notes on mount when authenticated", async () => {
    const mockNotes = [{ id: "1", globalId: "1:1.0.1", text: "test note" }];
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockNotes,
    } as Response);

    const { result } = renderHook(() => useNotes("1", "authenticated"));

    await waitFor(() => {
      expect(result.current.notes).toEqual(mockNotes);
    });
  });

  it("opens note modal on click", () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    const { result } = renderHook(() => useNotes("1", "authenticated"));

    act(() => result.current.onNoteClick("1:2.0.1")());
    expect(result.current.selectedGlobalIdNote).toBe("1:2.0.1");
  });

  it("closes note modal and refetches", async () => {
    const mockNotes = [{ id: "1", globalId: "1:1.0.1", text: "test" }];
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => mockNotes } as Response);

    const { result } = renderHook(() => useNotes("1", "authenticated"));

    act(() => result.current.onNoteClick("1:2.0.1")());
    act(() => result.current.onNoteClose());

    expect(result.current.selectedGlobalIdNote).toBe("");
    await waitFor(() => {
      expect(result.current.notes).toEqual(mockNotes);
    });
  });
});
