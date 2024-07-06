// Node modules.
import Link from "next/link";
import moment from "moment";
import throttle from "lodash/throttle";
import { Note as NoteType, ReadNode, Bookmark } from "@prisma/client";
import { Noto_Serif } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useWakeLock } from "react-screen-wake-lock";
// Relative modules.
import Note from "@/components/Note";
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Share from "@/components/Share";
import Spinner from "@/components/Spinner";
import TopReadingNavbar from "@/components/TopReadingNavbar";
import {
  AUDIO_ENABLED,
  AUDIO_ENABLED_PAPER_IDS,
  AVERAGE_READING_SPEED,
  NEXT_AUDIO_DELAY,
  PAPER_ID_TO_MP3_URL,
} from "@/utils/config";
import {
  getPaperIdFromPaperUrl,
  getValidPaperUrls,
  paperIdToUrl,
} from "@/utils/paperFormatters";

const notoSerifFont = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type PaperPageProps = {
  paperData: {
    data: {
      results: UBNode[];
    };
  };
};

const PaperPage = ({ paperData }: PaperPageProps) => {
  // Hooks.
  const router = useRouter();
  const { status } = useSession();
  const { isSupported, released, request, release } = useWakeLock({
    onRequest: () =>
      console.log(`[Screen Wake Lock]: Requested. Released: ${released}`),
    onError: (error) => console.log("[Screen Wake Lock]: Error", error),
    onRelease: () => console.log("[Screen Wake Lock]: Released"),
  });

  // Toggled states.
  const [expandedGlobalId, setExpandedGlobalId] = useState<string>("");

  // Bookmark states.
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Notes states.
  const [notes, setNotes] = useState<NoteType[]>([]);

  // Network states.
  const [savingGlobalIds, setSavingGlobalIds] = useState<string[]>([]);
  const [savingErrorGlobalIds, setSavingErrorGlobalIds] = useState<string[]>(
    []
  );

  // Font size state.
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(
    "medium"
  );

  // TOC states.
  const [tocExpanded, setTOCExpanded] = useState<boolean>(false);

  // Audio states.
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [currentPlayingNode, setCurrentPlayingNode] = useState<number | null>(
    null
  );
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  // Modal states.
  const [selectedGlobalIdNote, setSelectedGlobalIdNote] = useState<string>("");
  const [selectedGlobalIdExplain, setSelectedGlobalIdExplain] =
    useState<string>("");
  const [selectedGlobalIdRelatedWorks, setSelectedGlobalIdRelatedWorks] =
    useState<string>("");
  const [selectedGlobalIdShare, setSelectedGlobalIdShare] =
    useState<string>("");

  // Reading time states.
  const readingNodesRef = useRef<
    Record<string, { startsAt: number; node: UBNode }>
  >({});
  const [readNodes, setReadNodes] = useState<Set<string>>(new Set());

  // Sign-up prompt state.
  const [showSignUpPrompt, setShowSignUpPrompt] = useState<boolean>(false);

  // Get the nodes from the paper data.
  const nodes = paperData.data.results;

  // Get paper details.
  const paperId = nodes[0].paperId;
  const paperTitle = nodes[0].paperTitle;
  const paperIdNumber = parseInt(nodes[0].paperId);
  const nextPaperId = paperIdNumber < 196 ? paperIdNumber + 1 : null;

  // Calculate nodes for modals.
  const explainNode = selectedGlobalIdExplain
    ? nodes.find((node) => node.globalId === selectedGlobalIdExplain)
    : undefined;
  const noteNode = selectedGlobalIdNote
    ? nodes.find((node) => node.globalId === selectedGlobalIdNote)
    : undefined;
  const relatedWorksNode = selectedGlobalIdRelatedWorks
    ? nodes.find((node) => node.globalId === selectedGlobalIdRelatedWorks)
    : undefined;
  const shareNode = selectedGlobalIdShare
    ? nodes.find((node) => node.globalId === selectedGlobalIdShare)
    : undefined;

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
        setTimeout(() => {
          audio.playbackRate = playbackRate;
        }, 100);

        setCurrentPlayingNode(nodeIndex);
        audio.onended = () => {
          // Mark the paragraph as read after the audio finishes playing
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
    const SKIP_THRESHOLD = 3; // Set the threshold time in seconds

    if (currentPlayingNode !== null) {
      if (audioRef.current && audioRef.current.currentTime > SKIP_THRESHOLD) {
        // Restart the current node
        resetAudio();
        playAudio(currentPlayingNode);
      } else if (currentPlayingNode > 2) {
        // Play the previous node
        playAudio(currentPlayingNode - 1);
      }
    }
  };

  const findTopMostVisibleNode = (): HTMLElement | null => {
    const paragraphs = document.querySelectorAll(".paragraph");
    let topMostVisibleNode = null;
    let smallestPositiveTop = Infinity;

    paragraphs.forEach((paragraph) => {
      const rect = paragraph.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < smallestPositiveTop) {
        smallestPositiveTop = rect.top;
        topMostVisibleNode = paragraph;
      }
    });

    return topMostVisibleNode;
  };

  const onSignUpClick = () => {
    // Get the top most visible node in the viewport.
    const topMostVisibleNode = findTopMostVisibleNode();

    // Set the callback URL.
    let callbackUrl = `/papers/${paperIdToUrl(`${paperId}`)}`;
    if (topMostVisibleNode) {
      callbackUrl += `#${topMostVisibleNode.id}`;
    }

    // Sign in.
    router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(
        `/api/user/nodes/notes?paperId=${paperData.data.results[0].paperId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const notes = await response.json();
      setNotes(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const estimatedReadTime = (node: UBNode) => {
    const paragraph = document.getElementById(node.globalId);
    if (!paragraph) {
      console.warn(
        `Could not find paragraph with node.globalId ${node.globalId}, estimated read time will be 0 and paragraph will be immediately marked as read.`
      );
      return 0;
    }
    const words = paragraph.innerText.split(" ").length;
    return (words / AVERAGE_READING_SPEED) * 60; // Time in seconds
  };

  const markParagraphAsRead = async (node: UBNode) => {
    // Check if the node has already been marked as read
    if (readNodes.has(node.globalId)) {
      console.log(`Node ${node.globalId} has already been marked as read.`);
      return;
    }

    // Skip if you are not logged in
    if (status !== "authenticated") {
      console.log(
        `Skipping marking node ${node.globalId} as read because user is not logged in.`
      );
      return;
    }

    try {
      const response = await fetch("/api/user/nodes/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          globalId: node.globalId,
          paperId: node.paperId,
          paperSectionId: node.paperSectionId,
          paperSectionParagraphId: node.paperSectionParagraphId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const readNode = await response.json();
      console.log(`✅ Successfully marked node ${readNode.globalId} as read.`);

      // Add the node to the set of read nodes
      setReadNodes((readNodes) => new Set(readNodes.add(readNode.globalId)));
    } catch (error) {
      console.error("Error marking paragraph as read:", error);
    }
  };

  const resetReadingTime = (globalId: string) => {
    const currentReadings = readingNodesRef.current;
    if (currentReadings[globalId]) {
      delete currentReadings[globalId];
      readingNodesRef.current = currentReadings;
    }
  };

  const handleParagraphReadInView = (node: UBNode) => {
    // Check if the node has already been marked as read
    if (readNodes.has(node.globalId)) {
      console.log(
        `Node ${node.globalId} has already been marked as read, skipping.`
      );
      return;
    }

    const currentReadings = readingNodesRef.current;
    if (!currentReadings[node.globalId]) {
      currentReadings[node.globalId] = { startsAt: moment().unix(), node };
      readingNodesRef.current = currentReadings; // Update ref
    }
  };

  // Update the fontSize state and also save it to localStorage
  const updateFontSize = (size: "small" | "medium" | "large") => {
    setFontSize(size); // Update the state
    localStorage.setItem("fontSize", size); // Save the font size to localStorage
  };

  const updateLastVisitedNode = async (
    globalId: string,
    paperId: string,
    paperTitle: string
  ) => {
    // Update local storage.
    localStorage.setItem(
      "lastVisitedNode",
      JSON.stringify({ globalId, paperId, paperTitle })
    );

    // Skip if you are not logged in
    if (status !== "authenticated") {
      console.log(
        `✅ Updated last visited node (${globalId}) in local storage only because user is not logged in.`
      );
      return;
    }

    // Update the user's last visited node.
    try {
      const response = await fetch("/api/user/nodes/last-visited", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ globalId, paperId, paperTitle }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const lastVisitedNode = await response.json();
      console.log("✅ Updated user with last visited node:", lastVisitedNode);

      // Update the user's last visited node in local storage.
      localStorage.setItem("lastVisitedNode", JSON.stringify(lastVisitedNode));
    } catch (error) {
      console.error("Error updating last visited node:", error);
    }
  };

  // Now throttle the safe version of the update function
  const throttledUpdate = throttle(updateLastVisitedNode, 2000);

  // Reset the audio state.
  const resetAudio = async () => {
    // Stop and reset the audio
    if (audioRef?.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentPlayingNode(null);
  };

  useEffect(() => {
    if (currentPlayingNode !== null) {
      const element = document.getElementById(
        nodes[currentPlayingNode].globalId
      );
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPlayingNode]);

  // Cleanup timeout when component unmounts or currentPlayingNode changes
  useEffect(() => {
    return () => {
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
    };
  }, [currentPlayingNode]);

  // Cleanup audio when the route changes
  useEffect(() => {
    const handleRouteChange = () => {
      resetAudio();
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
      resetAudio();
    };
  }, [router, nodes]);

  // When playback rate is set, update the audio playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Fetch the initial font size from localStorage when the component mounts
  useEffect(() => {
    // Get the saved font size from localStorage, if it exists
    const savedFontSize = localStorage.getItem("fontSize") as
      | "small"
      | "medium"
      | "large";

    // If there's a saved font size, update the state
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
  }, []);

  useEffect(() => {
    console.log(`[Screen Wake Lock]: isSupported: ${isSupported}`);
    console.log(`[Screen Wake Lock]: Released: ${released}`);

    // Ensure the screen wake lock is requested when the component mounts
    if (isSupported) {
      void request();
    }

    // Ensure the screen wake lock is released when the component unmounts
    return () => {
      if (isSupported) {
        void release();
      }
    };
  }, []);

  // Fetch read nodes on mount
  useEffect(() => {
    if (status !== "authenticated") {
      console.log("Skipping fetch read nodes because user is not logged in.");
      return;
    }

    const fetchReadNodes = async () => {
      try {
        const response = await fetch(`/api/user/nodes/read?paperId=${paperId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const readNodes = await response.json();
        if (!readNodes) {
          console.log("No read nodes found for user.");
          return;
        }
        const globalIds = readNodes.map((node: ReadNode) => node.globalId);
        setReadNodes(new Set(globalIds));
      } catch (error) {
        console.error("Error fetching read nodes:", error);
      }
    };

    fetchReadNodes();
  }, [status, paperId]);

  // Fetch bookmarked globalIds on mount
  useEffect(() => {
    if (status !== "authenticated") {
      console.log(
        "Skipping bookmarked globalIds because user is not logged in."
      );
      return;
    }

    const fetchBookmarkedGlobalIds = async () => {
      try {
        const response = await fetch(
          `/api/user/nodes/bookmarks?paperId=${paperData.data.results[0].paperId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bookmarks = await response.json();
        setBookmarks(bookmarks);
      } catch (error) {
        console.error("Error fetching bookmarked globalIds:", error);
      }
    };

    fetchBookmarkedGlobalIds();
  }, [paperData.data.results, status]);

  // Fetch notes on mount
  useEffect(() => {
    if (status !== "authenticated") {
      console.log("Skipping notes because user is not logged in.");
      return;
    }

    fetchNotes();
  }, [paperData.data.results, status]);

  useEffect(() => {
    const handleScroll = () => {
      // Only show the sign-up prompt if the user is not authenticated,
      // the prompt is not hidden via sessionStorage, and the scroll position is over 400px
      const shouldShowPrompt =
        status === "unauthenticated" &&
        !sessionStorage.getItem("hideSignUpPrompt") &&
        window.scrollY > 400;

      setShowSignUpPrompt(shouldShowPrompt);
    };

    if (
      status === "unauthenticated" &&
      !sessionStorage.getItem("hideSignUpPrompt")
    ) {
      // Initially set the prompt based on the scroll position
      setShowSignUpPrompt(window.scrollY > 400);

      // Add scroll event listener
      window.addEventListener("scroll", handleScroll);
    }

    // Cleanup function to remove the event listener
    return () => window.removeEventListener("scroll", handleScroll);
  }, [status]);

  // Start reading timer checks.
  useEffect(() => {
    if (status !== "authenticated") {
      console.log(
        "Skipping reading timer checks because user is not logged in."
      );
      return;
    }

    const interval = setInterval(() => {
      const currentReadings = readingNodesRef.current;
      Object.entries(currentReadings).forEach(
        ([globalId, readingStartTime]) => {
          const now = moment().unix(); // Current time in seconds
          const timeElapsed = now - readingStartTime.startsAt; // Elapsed time in seconds
          const timeRemaining =
            estimatedReadTime(readingStartTime.node) - timeElapsed;

          console.log(
            `Node ${readingStartTime.node.globalId} has been in view for ${timeElapsed} seconds and has ${timeRemaining} seconds remaining.`
          );

          if (timeElapsed > estimatedReadTime(readingStartTime.node)) {
            console.log(
              `Marking node ${readingStartTime.node.globalId} as read.`
            );
            // The paragraph has been in view long enough
            markParagraphAsRead(readingStartTime.node);

            // Remove the node from the current readings.
            delete currentReadings[globalId];
            readingNodesRef.current = currentReadings; // Update ref
          }
        }
      );
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [status]);

  // Start observing paragraphs and when they come into view, start the reading timer.
  useEffect(() => {
    if (status !== "authenticated") {
      console.log(
        "Skipping paragraph observer (for reading) because user is not logged in."
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const globalId = entry.target.getAttribute("id");
          if (!globalId) {
            console.warn(
              `Could not find globalId for paragraph with id ${entry.target.id}.`
            );
            return;
          }

          const node = paperData.data.results.find(
            (n) => n.globalId === globalId
          );
          if (!node) {
            console.warn(
              `Could not find node with globalId ${globalId} in paperData.`
            );
            return;
          }

          if (entry.isIntersecting) {
            // Paragraph comes into view
            handleParagraphReadInView(node);
          } else {
            // Paragraph leaves view
            resetReadingTime(globalId);
          }
        });
      },
      { threshold: 0.2 } // Threshold means that 50% of the paragraph must be in the viewport
    );

    document.querySelectorAll(".paragraph").forEach((node) => {
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, [paperData, status]);

  // Start observing paragraphs and when they come into view, update the user's last visited node.
  useEffect(() => {
    let visibleNodes = new Map();
    let currentTopNode: any = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const globalId = entry.target.getAttribute("id");

          if (entry.isIntersecting) {
            visibleNodes.set(globalId, entry.target);
          } else {
            visibleNodes.delete(globalId);
          }

          if (visibleNodes.size > 0) {
            // Find the topmost visible node
            const topNode = Array.from(visibleNodes.values()).reduce(
              (top, current) =>
                top.getBoundingClientRect().top <
                current.getBoundingClientRect().top
                  ? top
                  : current
            );

            // Update the user's last visited node if it has changed
            if (
              topNode &&
              topNode.getAttribute("id") !== currentTopNode &&
              window.location.href.includes("/papers/")
            ) {
              currentTopNode = topNode.getAttribute("id");
              throttledUpdate(currentTopNode, paperId, paperTitle);
            }
          }
        });
      },
      { threshold: 0.2 } // Threshold means that 20% of the paragraph must be in the viewport
    );

    document.querySelectorAll(".paragraph").forEach((node) => {
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, [paperData]);

  // Scroll to the hash on mount and highlight the query text if there is one.
  useEffect(() => {
    // Extracting the hash and query parameter from the URL.
    const [globalId, queryParam] =
      router.asPath.split("#")[1]?.split("?") || [];
    const queryParams = new URLSearchParams(queryParam);
    const query = queryParams.get("q");

    if (globalId) {
      const element = document.getElementById(globalId);
      if (element) {
        // Scroll to the element.
        const yOffset = -20;
        const y =
          element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y });

        // Highlight the query text, it's done this way because we don't want to replace the
        // raw HTML since it will destroy event listeners.
        const highlightQueryText = (element: any, query: string) => {
          const regex = new RegExp(query, "gi");

          const recurseAndHighlight = (node: any) => {
            if (node.nodeType === 3) {
              // Text node
              let match;
              while ((match = regex.exec(node.textContent)) !== null) {
                const highlightSpan = document.createElement("span");
                highlightSpan.className = "text-sky-400 underline";
                highlightSpan.textContent = match[0];

                const range = new Range();
                range.setStart(node, match.index);
                range.setEnd(node, match.index + match[0].length);

                range.deleteContents();
                range.insertNode(highlightSpan);
                range.setStartAfter(highlightSpan);
              }
            } else if (node.nodeType === 1) {
              // Element node
              Array.from(node.childNodes).forEach(recurseAndHighlight);
            }
          };

          recurseAndHighlight(element);
        };

        if (query) {
          highlightQueryText(element, query);
        }
      }
    }
  }, [router.asPath, router.query, router.pathname]);

  // Show a spinner until the content has loaded.
  if (!paperData) {
    return <Spinner />;
  }

  // Helpers.
  const onExplainClose = () => {
    setSelectedGlobalIdExplain("");
  };

  const onNoteClose = () => {
    setSelectedGlobalIdNote("");
    void fetchNotes();
  };

  const onNoteClick = (globalId: string) => () => {
    setSelectedGlobalIdNote(globalId);
  };

  const onRelatedWorksClose = () => {
    setSelectedGlobalIdRelatedWorks("");
  };

  const onShareClose = () => {
    setSelectedGlobalIdShare("");
  };

  const onShareClick = (globalId: string) => () => {
    setSelectedGlobalIdShare(globalId);
  };

  const onNodeSettingsClick =
    (globalId: string, options?: { onlyOpen: boolean }) => () => {
      if (options?.onlyOpen) {
        setExpandedGlobalId(globalId);
        return;
      }

      if (expandedGlobalId === globalId) {
        setExpandedGlobalId("");
        return;
      }

      setExpandedGlobalId(globalId);
    };

  const bookmarkGlobalId = async (
    globalId: string,
    paperId: string,
    paperSectionId?: string,
    paperSectionParagraphId?: string
  ): Promise<Bookmark | undefined> => {
    // Escape early if we are already saving.
    if (savingGlobalIds.includes(globalId)) {
      return;
    }

    // Escape early if we aren't logged in.
    if (status !== "authenticated") {
      console.warn("User is not logged in, cannot bookmark global ID.");
      return;
    }

    // Set saving state + reset error for globalId.
    setSavingGlobalIds([...savingGlobalIds, globalId]);
    const updatedSavingErrorGlobalIds = savingErrorGlobalIds.filter(
      (id) => id !== globalId
    );
    setSavingErrorGlobalIds(updatedSavingErrorGlobalIds);

    try {
      // Make request to bookmark node for user.
      const response = await fetch(`/api/user/nodes/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          globalId,
          paperId,
          paperSectionId,
          paperSectionParagraphId,
        }),
      });
      if (response.status !== 201) {
        throw new Error(
          `Unexpected response status ${response.status} when attempting to bookmark global ID ${globalId} for user.`
        );
      }
      const bookmark = await response.json();
      return bookmark;
    } catch (error: any) {
      // Set error state for globalId.
      console.error("Error attempting to bookmark global ID for user:", error);
      setSavingErrorGlobalIds([...savingErrorGlobalIds, globalId]);
      return;
    } finally {
      // Remove globalId from saving list.
      const updatedSavingGlobalIds = savingGlobalIds.filter(
        (id) => id !== globalId
      );
      setSavingGlobalIds(updatedSavingGlobalIds);
    }
  };

  const deleteBookmarkGlobalId = async (globalId: string) => {
    // Escape early if we are already saving.
    if (savingGlobalIds.includes(globalId)) {
      return;
    }

    // Escape early if we aren't logged in.
    if (status !== "authenticated") {
      console.warn("User is not logged in, cannot de-bookmark global ID.");
      return;
    }

    // Set saving state + reset error for globalId.
    setSavingGlobalIds([...savingGlobalIds, globalId]);
    const updatedSavingErrorGlobalIds = savingErrorGlobalIds.filter(
      (id) => id !== globalId
    );
    setSavingErrorGlobalIds(updatedSavingErrorGlobalIds);

    try {
      // Make request to de-bookmark node for user.
      const response = await fetch(
        `/api/user/nodes/bookmarks?globalId=${globalId}`,
        {
          method: "DELETE",
        }
      );
      if (response.status !== 204) {
        throw new Error(
          `Unexpected response status ${response.status} when attempting to delete bookmark global ID ${globalId} for user.`
        );
      }
    } catch (error: any) {
      // Set error state for globalId.
      console.error(
        "Error attempting to de-bookmark global ID for user:",
        error
      );
      setSavingErrorGlobalIds([...savingErrorGlobalIds, globalId]);
    } finally {
      // Remove globalId from saving list.
      const updatedSavingGlobalIds = savingGlobalIds.filter(
        (id) => id !== globalId
      );
      setSavingGlobalIds(updatedSavingGlobalIds);
    }
  };

  const onBookmarkClick = (node: UBNode) => async () => {
    // Escape early if we are already saving.
    if (savingGlobalIds.includes(node.globalId)) {
      return;
    }

    // De-bookmark the node if it's already bookmarked.
    if (bookmarks.some((bookmark) => bookmark.globalId === node.globalId)) {
      // Make request to de-bookmark globalId for user.
      await deleteBookmarkGlobalId(node.globalId);

      // Remove the id.
      setBookmarks(
        bookmarks.filter((bookmark) => bookmark.globalId !== node.globalId)
      );
      return;
    }

    // Make request to bookmark globalId for user.
    const bookmark = await bookmarkGlobalId(
      node.globalId,
      node.paperId,
      node.paperSectionId,
      node.paperSectionParagraphId
    );

    // Add the id.
    if (bookmark) {
      setBookmarks([...bookmarks, bookmark]);
    }
  };

  const renderNode = (node: UBNode) => {
    switch (node.type) {
      case "paper": {
        return (
          <div
            key={node.globalId}
            className={`${notoSerifFont.className} tracking-tight font-serif antialiased leading-relaxed mt-4 mb-8 text-center`}
          >
            {parseInt(node.paperId) > 0 && (
              <p className="mb-2 text-gray-600 dark:text-gray-400">
                {node.paperTitle}
              </p>
            )}

            <h1 className="text-5xl font-bold mb-2" id={node.globalId}>
              {parseInt(node.paperId) > 0 ? node.paperId : "Foreword"}
            </h1>

            <Link
              className="text-blue-500 dark:text-blue-400 text-sm"
              href={`${process.env.NEXT_PUBLIC_AUDIO_FILES_CDN}/${node.paperId}.mp3`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Full Paper Audio
            </Link>

            {/* Small - XL Screen TOC */}
            <div className="flex flex-col items-left text-left xl:hidden mt-8">
              <h2
                className={`${
                  tocExpanded
                    ? "text-gray-600 dark:text-white"
                    : "text-gray-400"
                } text-sm flex items-center hover:text-gray-600 hover:dark:text-white transition-all duration-300 cursor-pointer`}
                onClick={() => setTOCExpanded(!tocExpanded)}
              >
                Table of Contents{" "}
                <svg
                  className={`w-6 h-6 ${
                    tocExpanded ? "-rotate-90" : "rotate-90"
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"
                  />
                </svg>
              </h2>
              {tocExpanded &&
                nodes.map((node: UBNode) =>
                  renderTOCNode(node, { skipPaperTitle: true })
                )}
            </div>
          </div>
        );
      }
      case "section": {
        if (!node.sectionTitle) return null;
        return (
          <div key={node.globalId} className="mt-16 mb-6 text-center">
            <h2
              className={`${notoSerifFont.className} tracking-tight font-serif antialiased leading-relaxed text-3xl font-bold`}
              id={node.globalId}
            >
              {node.sectionTitle}
            </h2>
          </div>
        );
      }
      case "paragraph": {
        const bookmark = bookmarks.find(
          (bookmark) => bookmark.globalId === node.globalId
        );
        const notesForNode = notes.filter(
          (note) => note.globalId === node.globalId
        );
        const isPlayingNode = currentPlayingNode === nodes.indexOf(node);

        return (
          <div
            className={`paragraph mb-2 text-left ${
              currentPlayingNode &&
              isPlayingNode &&
              (isPlaying || isTransitioning)
                ? "border-l-4 border-gray-200 dark:border-white pl-4 -ml-5"
                : ""
            }`}
            id={node.globalId}
            key={node.globalId}
          >
            <div
              className={`${notoSerifFont.className} tracking-tight font-serif antialiased text-lg leading-relaxed`}
            >
              <div
                className="flex items-center justify-between block text-gray-400 text-sm -mb-1.5"
                style={{ minHeight: "28px" }}
              >
                <div className="flex items-center">
                  <span
                    className={`fade-in flex items-center text-xs tracking-tighter`}
                  >
                    ({node.standardReferenceId}){" "}
                    {false && readNodes.has(node.globalId) && (
                      // Hiding the read indicator for now.
                      <svg
                        className="fade-in w-3.5 h-3.5 text-gray-400 ml-0.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          className="fill-current"
                          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                        />
                      </svg>
                    )}
                  </span>
                </div>
                <div className="flex items-center select-none">
                  <div className="flex items-center mr-2 fade-in">
                    {/* Audio Button */}
                    {AUDIO_ENABLED &&
                      AUDIO_ENABLED_PAPER_IDS.includes(node.paperId) &&
                      node.mp3Url &&
                      (expandedGlobalId === node.globalId ||
                        notesForNode.length > 0) && (
                        <button
                          aria-label="Play"
                          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:text-white dark:bg-neutral-700 hover:dark:text-white border-0 rounded-full p-0.5 mr-3 focus:outline-none transition duration-300 ease-in-out relative"
                          onClick={() =>
                            currentPlayingNode === nodes.indexOf(node) &&
                            (isPlaying || isTransitioning)
                              ? togglePlayPause()
                              : playAudio(nodes.indexOf(node))
                          }
                          type="button"
                        >
                          {deriveAudioContent(nodes.indexOf(node))}
                        </button>
                      )}

                    {/* Notes Button */}
                    {status === "authenticated" &&
                      (expandedGlobalId === node.globalId ||
                        notesForNode.length > 0) && (
                        <button
                          aria-label="Notes"
                          className="bg-transparent border-0 dark:border-0 p-0 dark:p-0 m-0 mr-3 focus:outline-0 focus:dark:outline-0 text-gray-400 dark:text-gray-400 text-sm hover:text-gray-600 hover:dark:text-white transition duration-300 ease-in-out relative"
                          onClick={onNoteClick(node.globalId)}
                          type="button"
                        >
                          <svg className="w-7 h-7" viewBox="0 0 24 24">
                            <path
                              className="fill-current"
                              d="M3 10h11v2H3zm0-2h11V6H3zm0 8h7v-2H3zm15.01-3.13.71-.71c.39-.39 1.02-.39 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-.71.71zm-.71.71-5.3 5.3V21h2.12l5.3-5.3z"
                            />
                          </svg>

                          {/* Number of notes created for the paragraph in top left */}
                          {notesForNode.length > 0 && (
                            <span className="absolute -top-1 -right-1 text-white text-xs font-semibold rounded-full px-1 bg-orange-500">
                              {notesForNode.length > 9
                                ? "9+"
                                : notesForNode.length}
                            </span>
                          )}
                        </button>
                      )}

                    {/* Share Button */}
                    {expandedGlobalId === node.globalId && (
                      <button
                        aria-label="Share"
                        className="bg-transparent border-0 dark:border-0 p-0 dark:p-0 m-0 focus:outline-0 focus:dark:outline-0 text-gray-400 dark:text-gray-400 text-sm hover:text-gray-600 hover:dark:text-white transition duration-300 ease-in-out"
                        onClick={onShareClick(node.globalId)}
                        type="button"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            className="fill-current"
                            d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Bookmark Button */}
                    {status === "authenticated" &&
                      (expandedGlobalId === node.globalId || bookmark) && (
                        <button
                          aria-label="Bookmark"
                          className="bg-transparent border-0 dark:border-0 p-0 dark:p-0 m-0 ml-4 focus:outline-0 focus:dark:outline-0 text-gray-400 dark:text-gray-400 text-sm hover:text-gray-600 hover:dark:text-white transition duration-300 ease-in-out"
                          onClick={onBookmarkClick(node)}
                          type="button"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            {bookmark ? (
                              <path
                                className="fill-emerald-400"
                                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                              />
                            ) : (
                              <path
                                className="stroke-current fill-transparent stroke-2"
                                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                              />
                            )}
                          </svg>
                        </button>
                      )}
                  </div>

                  {/* Ellipsis button */}
                  {expandedGlobalId !== node.globalId && (
                    <button
                      aria-label="Settings"
                      className="bg-transparent border-0 dark:border-0 p-0 dark:p-0 m-0 focus:outline-0 focus:dark:outline-0 text-gray-400 dark:text-gray-400 text-sm hover:text-gray-600 hover:dark:text-white transition duration-300 ease-in-out"
                      onClick={onNodeSettingsClick(node.globalId)}
                      type="button"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          className="fill-current"
                          d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div
                className={`${getFontSizeClasses()} ${
                  currentPlayingNode &&
                  !isPlayingNode &&
                  (isPlaying || isTransitioning)
                    ? "text-gray-400"
                    : ""
                }`}
                onClick={onNodeSettingsClick(node.globalId, {
                  onlyOpen: true,
                })}
                onMouseDown={onNodeSettingsClick(node.globalId, {
                  onlyOpen: true,
                })}
              >
                <span
                  dangerouslySetInnerHTML={{ __html: node.htmlText as string }}
                />
              </div>
            </div>
          </div>
        );
      }
      default: {
        return null;
      }
    }
  };

  const deriveAudioContent = (nodeIndex?: number): JSX.Element => {
    // If a node index is provided, we can determine if it's playing or not.
    if (typeof nodeIndex !== "undefined") {
      if (currentPlayingNode === nodeIndex && (isPlaying || isTransitioning)) {
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="currentColor" d="M14 19h4V5h-4v14zM6 5v14h4V5H6z" />
          </svg>
        );
      }

      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path fill="currentColor" d="M8 5v14l11-7z" />
        </svg>
      );
    }

    // If no node index is provided, we can only determine if the audio is playing or not.
    if (isPlaying || isTransitioning) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path fill="currentColor" d="M14 19h4V5h-4v14zM6 5v14h4V5H6z" />
        </svg>
      );
    }

    // Default to play icon.
    return (
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path fill="currentColor" d="M8 5v14l11-7z" />
      </svg>
    );
  };

  const renderTOCNode = (
    node: UBNode,
    options: { skipPaperTitle?: boolean } = {}
  ) => {
    switch (node.type) {
      case "paper": {
        if (options.skipPaperTitle) return null;
        return (
          <>
            <p className="text-xs text-gray-400">Paper {paperId}</p>
            <h2 className="m-0">{paperTitle}</h2>
          </>
        );
      }
      case "section": {
        return (
          <p className="text-sm mt-2 text-gray-400">
            <Link
              className="text-gray-400 hover:text-gray-600 hover:dark:text-white transition-all duration-300"
              href={node.sectionId === "0" ? "#" : `#${node.globalId}`}
            >
              {node.sectionTitle || "Introduction"}
            </Link>
          </p>
        );
      }
      default: {
        return null;
      }
    }
  };

  // Page content
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        metaDescription={`${
          paperIdNumber > 0
            ? `Urantia Paper ${paperId} - ${paperTitle}`
            : "Urantia Papers Foreword"
        } - ${paperData.data.results[2].text}`}
        titlePrefix={
          paperIdNumber > 0 ? `Paper ${paperId} - ${paperTitle}` : "Foreword"
        }
      />

      <TopReadingNavbar fontSize={fontSize} setFontSize={updateFontSize} />

      <Navbar
        audioContent={deriveAudioContent()}
        audioOnPlay={() =>
          isPlaying || isTransitioning
            ? togglePlayPause()
            : playAudio(currentPlayingNode || 0)
        }
        audioIsPlaying={isPlaying || isTransitioning}
        paperId={paperIdNumber}
        paperTitle={paperTitle}
        showAudio={AUDIO_ENABLED && AUDIO_ENABLED_PAPER_IDS.includes(paperId)}
        skipToNextParagraph={skipToNextParagraph}
        skipToPreviousParagraph={skipToPreviousParagraph}
        setPlaybackRate={setPlaybackRate}
        playbackRate={playbackRate}
      />

      {/* Conditional Sign-up Prompt */}
      {status === "unauthenticated" && showSignUpPrompt && (
        // purple box shadow
        <div className="z-10 fixed top-4 left-4 right-4 text-gray-600 bg-slate-50 dark:text-white dark:bg-neutral-900 p-4 rounded-lg text-sm pr-8 max-w-lg mx-auto fade-in shadow-lg shadow-purple-600/30 dark:shadow-purple-400/20">
          <p>
            Unlock handy features like bookmarking and notes.{" "}
            <button
              className="text-sky-600 dark:text-sky-400 hover:underline p-0 m-0 border-none bg-transparent focus:outline-none"
              onClick={onSignUpClick}
              type="button"
            >
              Sign in or create an account
            </button>
          </p>
          <button
            aria-label="Close sign-up prompt"
            className="absolute top-4 right-4 text-lg bg-transparent border-none p-0 m-0 focus:outline-none text-gray-400 hover:text-gray-600 hover:dark:text-white transition duration-300 ease-in-out"
            onClick={() => {
              sessionStorage.setItem("hideSignUpPrompt", "true");
              setShowSignUpPrompt(false);
            }}
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 122.878 122.88">
              <path d="M1.426 8.313a4.87 4.87 0 0 1 6.886-6.886l53.127 53.127 53.127-53.127a4.87 4.87 0 1 1 6.887 6.886L68.324 61.439l53.128 53.128a4.87 4.87 0 0 1-6.887 6.886L61.438 68.326 8.312 121.453a4.868 4.868 0 1 1-6.886-6.886l53.127-53.128L1.426 8.313z" />
            </svg>
          </button>
        </div>
      )}

      {/* Note Modal */}
      {selectedGlobalIdNote && <Note onClose={onNoteClose} node={noteNode} />}

      {/* Share Modal */}
      {selectedGlobalIdShare && (
        <Share onClose={onShareClose} node={shareNode} />
      )}

      <main className="relative mt-16 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        {/* Paper content */}
        <div className="mb-12 subpixel-antialiased">
          {nodes.map((node: UBNode) => renderNode(node))}
        </div>

        {/* Navigation links for previous and next papers */}
        <div className="flex justify-end text-right mb-12">
          {nextPaperId ? (
            <Link
              className="flex text-right text-gray-400 hover:text-gray-600 hover:dark:text-white transition duration-300 ease-in-out"
              href={`/papers/${paperIdToUrl(`${nextPaperId}`)}`}
            >
              Next{" "}
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"
                />
              </svg>
            </Link>
          ) : (
            <span />
          )}
        </div>

        {/* XL Screen TOC */}
        {tocExpanded ? (
          <div className="hidden rounded-lg xl:flex xl:flex-col fixed top-14 left-6 bg-white dark:bg-neutral-700/80 z-10 p-4 max-w-xs shadow-lg dark:shadow-none">
            <svg
              className={`w-6 h-6 ${
                tocExpanded ? "-rotate-90" : "rotate-90"
              } absolute top-2 right-2 cursor-pointer text-gray-400 hover:text-gray-600 dark:text-white dark:hover:text-white transition-all duration-300`}
              onClick={() => setTOCExpanded(!tocExpanded)}
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"
              />
            </svg>
            {nodes.map((node: UBNode) => renderTOCNode(node))}
          </div>
        ) : (
          <div
            aria-label="button"
            className="hidden rounded-lg xl:flex xl:flex-col fixed top-14 left-6 bg-white dark:bg-neutral-700/80 z-10 p-2 max-w-xs shadow-lg dark:shadow-none"
            onClick={() => setTOCExpanded(!tocExpanded)}
          >
            <svg
              className={`w-6 h-6 ${
                tocExpanded ? "-rotate-90" : "rotate-90"
              } cursor-pointer text-gray-400 hover:text-gray-600 dark:text-white dark:hover:text-white transition-all duration-300`}
              onClick={() => setTOCExpanded(!tocExpanded)}
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"
              />
            </svg>
          </div>
        )}
      </main>

      <Footer marginBottom="8.5rem" />
    </div>
  );
};

export async function getStaticProps(context: any) {
  const { paperName } = context.params as { paperName: string };

  // Get valid paper URLs.
  const validPaperUrls = getValidPaperUrls();

  // Check if the paperName is a valid paper URL.
  if (!validPaperUrls.includes(paperName)) {
    // If the paperName is a paperId, redirect to the correct URL.
    const paperId = Number(paperName);

    if (!isNaN(paperId) && paperId >= 0 && paperId <= 196) {
      const paperUrl = paperIdToUrl(String(paperId));
      return {
        redirect: {
          destination: `/papers/${paperUrl}`,
          permanent: true,
        },
      };
    }

    // If the paperName is not a valid paper URL, return a 404.
    return {
      notFound: true,
    };
  }

  const paperId = getPaperIdFromPaperUrl(paperName);
  if (Number.isNaN(paperId)) {
    return {
      notFound: true,
    };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/api/v1/urantia-book/read?paperId=${paperId}`
  );
  const paperData = await res.json();

  // Add mp3 file URLs for each node if there is one.
  paperData?.data?.results?.forEach((node: UBNode) => {
    if (PAPER_ID_TO_MP3_URL[node.paperId as keyof typeof PAPER_ID_TO_MP3_URL]) {
      node.mp3Url = `${
        PAPER_ID_TO_MP3_URL[node.paperId as keyof typeof PAPER_ID_TO_MP3_URL]
      }${node.globalId}.mp3`;
    }
  });

  return {
    props: {
      paperData,
    },
  };
}

export async function getStaticPaths() {
  const allPaperIds = Array.from(Array(197).keys());
  const paths = allPaperIds.map((paperId) => {
    const paperName = paperIdToUrl(String(paperId));
    return { params: { paperName } };
  });

  return {
    paths,
    fallback: "blocking",
  };
}

export default PaperPage;
