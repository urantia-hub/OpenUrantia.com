import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useBookmarks } from "./useBookmarks";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("useBookmarks", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not fetch bookmarks when unauthenticated", () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    renderHook(() => useBookmarks("1", "unauthenticated"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches bookmarks on mount when authenticated", async () => {
    const mockBookmarks = [{ id: "b1", globalId: "1:1.0.1", paperId: "1" }];
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookmarks,
    } as Response);

    const { result } = renderHook(() => useBookmarks("1", "authenticated"));

    await waitFor(() => {
      expect(result.current.bookmarks).toEqual(mockBookmarks);
    });
  });

  it("creates a bookmark successfully", async () => {
    const newBookmark = { id: "b2", globalId: "1:2.0.1", paperId: "1" };
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response) // initial fetch
      .mockResolvedValueOnce({ status: 201, json: async () => newBookmark } as Response); // create

    const { result } = renderHook(() => useBookmarks("1", "authenticated"));

    await waitFor(() => expect(result.current.bookmarks).toEqual([]));

    let bookmark: any;
    await act(async () => {
      bookmark = await result.current.bookmarkGlobalId("1:2.0.1", "1", "1.2", "1.2.1");
    });

    expect(bookmark).toEqual(newBookmark);
  });

  it("deletes a bookmark successfully", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response) // initial fetch
      .mockResolvedValueOnce({ status: 204 } as Response); // delete

    const { result } = renderHook(() => useBookmarks("1", "authenticated"));
    await waitFor(() => expect(result.current.bookmarks).toEqual([]));

    await act(async () => {
      await result.current.deleteBookmarkGlobalId("1:2.0.1");
    });

    // Should not throw
    expect(result.current.savingErrorGlobalIds).toEqual([]);
  });

  it("handles bookmark creation error", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({ status: 500 } as Response);

    const { result } = renderHook(() => useBookmarks("1", "authenticated"));
    await waitFor(() => expect(result.current.bookmarks).toEqual([]));

    await act(async () => {
      await result.current.bookmarkGlobalId("1:2.0.1", "1");
    });

    expect(result.current.savingErrorGlobalIds).toContain("1:2.0.1");
  });
});
