import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useReadProgress } from "./useReadProgress";

// Mock moment
vi.mock("moment", () => ({
  default: () => ({ unix: () => 1000 }),
}));

// Mock config
vi.mock("@/utils/config", () => ({
  AVERAGE_READING_SPEED: 200,
}));

const mockNodes: UBNode[] = [
  { globalId: "1:1.0.1", paperId: "1", paperTitle: "Test", type: "paragraph", labels: [], language: "eng", objectID: "1" },
];

describe("useReadProgress", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("does not fetch read nodes when unauthenticated", () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    renderHook(() => useReadProgress("1", "Test Paper", mockNodes, "unauthenticated"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches read nodes on mount when authenticated", async () => {
    const mockReadNodes = [{ globalId: "1:1.0.1" }];
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockReadNodes,
    } as Response);

    const { result } = renderHook(() => useReadProgress("1", "Test Paper", mockNodes, "authenticated"));

    await waitFor(() => {
      expect(result.current.readNodes.has("1:1.0.1")).toBe(true);
    });
  });

  it("initializes with empty read nodes set", () => {
    const { result } = renderHook(() => useReadProgress("1", "Test Paper", mockNodes, "unauthenticated"));
    expect(result.current.readNodes.size).toBe(0);
  });
});
