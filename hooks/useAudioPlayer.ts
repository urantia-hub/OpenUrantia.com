import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { NEXT_AUDIO_DELAY } from "@/utils/config";

export function useAudioPlayer(nodes: UBNode[], markParagraphAsRead: (node: UBNode) => Promise<void>) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPlayingNode, setCurrentPlayingNode] = useState<number | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentPlayingNode(null);
  };

  const playNextAudio = (nodeIndex: number) => {
    setIsTransitioning(true);
    audioTimeoutRef.current = setTimeout(() => {
      if (nodeIndex < nodes.length) {
        playAudio(nodeIndex);
      } else {
        setIsPlaying(false);
        setCurrentPlayingNode(null);
      }
      setIsTransitioning(false);
    }, NEXT_AUDIO_DELAY);
  };

  const playAudio = async (nodeIndex: number = 0) => {
    if (audioRef.current && currentPlayingNode === nodeIndex) {
      try {
        await audioRef.current.play();
        setTimeout(() => {
          if (audioRef.current) audioRef.current.playbackRate = playbackRate;
        }, 100);
        setIsPlaying(true);
      } catch (error) {
        console.error("Error resuming audio:", error);
      }
      return;
    }

    const audio = new Audio(nodes[nodeIndex].mp3Url);
    if (audio) {
      try {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
        }

        audio.onplay = () => setIsPlaying(true);
        audio.onpause = () => setIsPlaying(false);

        audioRef.current = audio;
        await audio.play();
        setTimeout(() => { audio.playbackRate = playbackRate; }, 100);

        setCurrentPlayingNode(nodeIndex);
        audio.onended = () => {
          if (nodes[nodeIndex].type === "paragraph") {
            markParagraphAsRead(nodes[nodeIndex]);
          }
          playNextAudio(nodeIndex + 1);
        };
      } catch (error) {
        console.error("Error playing audio:", error);
        playNextAudio(nodeIndex + 1);
      }
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      playAudio(currentPlayingNode || 0);
    }
  };

  const skipToNextParagraph = () => {
    if (currentPlayingNode !== null && currentPlayingNode < nodes.length - 1) {
      playAudio(currentPlayingNode + 1);
    }
  };

  const skipToPreviousParagraph = () => {
    const SKIP_THRESHOLD = 3;
    if (currentPlayingNode !== null) {
      if (audioRef.current && audioRef.current.currentTime > SKIP_THRESHOLD) {
        resetAudio();
        playAudio(currentPlayingNode);
      } else if (currentPlayingNode > 2) {
        playAudio(currentPlayingNode - 1);
      }
    }
  };

  // Scroll to playing node
  useEffect(() => {
    if (currentPlayingNode !== null && nodes?.[currentPlayingNode]?.globalId) {
      const element = document.getElementById(nodes[currentPlayingNode].globalId);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPlayingNode]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
    };
  }, [currentPlayingNode]);

  // Reset on route change
  useEffect(() => {
    const handleRouteChange = () => resetAudio();
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
      resetAudio();
    };
  }, [router, nodes]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  return {
    isPlaying,
    isTransitioning,
    currentPlayingNode,
    playbackRate,
    setPlaybackRate,
    audioRef,
    playAudio,
    togglePlayPause,
    skipToNextParagraph,
    skipToPreviousParagraph,
    resetAudio,
  };
}
