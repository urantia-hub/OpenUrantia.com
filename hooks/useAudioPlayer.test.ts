import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAudioPlayer } from "./useAudioPlayer";

// Mock next/router
vi.mock("next/router", () => ({
  useRouter: () => ({
    events: { on: vi.fn(), off: vi.fn() },
  }),
}));

// Mock config
vi.mock("@/utils/config", () => ({
  NEXT_AUDIO_DELAY: 0,
}));

const mockNodes: UBNode[] = [
  { globalId: "1:1.0.1", paperId: "1", paperTitle: "Test", type: "paragraph", mp3Url: "test.mp3", labels: [], language: "eng", objectID: "1" },
  { globalId: "1:1.0.2", paperId: "1", paperTitle: "Test", type: "paragraph", mp3Url: "test2.mp3", labels: [], language: "eng", objectID: "2" },
];

describe("useAudioPlayer", () => {
  const mockMarkAsRead = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockMarkAsRead.mockClear();
  });

  it("initializes with audio not playing", () => {
    const { result } = renderHook(() => useAudioPlayer(mockNodes, mockMarkAsRead));
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentPlayingNode).toBeNull();
    expect(result.current.playbackRate).toBe(1.0);
  });

  it("toggles play/pause when no audio loaded", async () => {
    const { result } = renderHook(() => useAudioPlayer(mockNodes, mockMarkAsRead));
    // togglePlayPause with no audio loaded should try to play
    // Since Audio is not available in jsdom, this tests the code path
    await act(async () => {
      result.current.togglePlayPause();
    });
  });

  it("updates playback rate", () => {
    const { result } = renderHook(() => useAudioPlayer(mockNodes, mockMarkAsRead));
    act(() => {
      result.current.setPlaybackRate(1.5);
    });
    expect(result.current.playbackRate).toBe(1.5);
  });

  it("resets audio state", () => {
    const { result } = renderHook(() => useAudioPlayer(mockNodes, mockMarkAsRead));
    act(() => {
      result.current.resetAudio();
    });
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentPlayingNode).toBeNull();
  });
});
