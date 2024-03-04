// Node modules.
import Link from "next/link";
import moment from "moment";
import throttle from "lodash/throttle";
import { Note as NoteType, ReadNode, Bookmark } from "@prisma/client";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
// Relative modules.
import Note from "@/components/Note";
import Explain from "@/components/Explain";
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import RelatedWorks from "@/components/RelatedWorks";
import Share from "@/components/Share";
import Spinner from "@/components/Spinner";

const AVERAGE_READING_SPEED = 300; // Words per minute
const NEXT_AUDIO_DELAY = 300; // Milliseconds

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

  // Toggled states.
  const [expandedGlobalId, setExpandedGlobalId] = useState<string>("");

  // bookmarks.
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // notes.
  const [notes, setNotes] = useState<NoteType[]>([]);

  // Network states.
  const [savingGlobalIds, setSavingGlobalIds] = useState<string[]>([]);
  const [savingErrorGlobalIds, setSavingErrorGlobalIds] = useState<string[]>(
    []
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

  const playAudio = async (nodeIndex: number = 0) => {
    // If there's already an audio and it's for the current node, resume it
    if (audioRef.current && currentPlayingNode === nodeIndex) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error resuming audio:", error);
      }
      return;
    }

    // Otherwise, create a new audio for the node
    if (nodes[nodeIndex].mp3Url) {
      try {
        // Stop and clean up any existing audio
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
        }

        // Create a new audio
        const audio = new Audio(nodes[nodeIndex].mp3Url);

        // Add event listeners
        audio.onplay = () => setIsPlaying(true);
        audio.onpause = () => setIsPlaying(false);

        // Set the current audio.
        audioRef.current = audio;

        // Play the audio.
        await audio.play();

        // Set the current playing node.
        setCurrentPlayingNode(nodeIndex);

        // Play the next audio when this one ends.
        audio.onended = () => {
          playNextAudio(nodeIndex + 1);
        };
      } catch (error) {
        console.error("Error playing audio:", error);
        playNextAudio(nodeIndex + 1);
      }
    }
  };

  const playNextAudio = (nodeIndex: number) => {
    setIsTransitioning(true); // Start transitioning
    audioTimeoutRef.current = setTimeout(() => {
      if (nodeIndex < nodes.length) {
        playAudio(nodeIndex);
      } else {
        setIsPlaying(false);
        setCurrentPlayingNode(null);
      }
      setIsTransitioning(false); // End transitioning
    }, NEXT_AUDIO_DELAY);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        // Pause the current audio
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Resume playing the current audio from where it was paused
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // If there's no current audio (first time play), start from the beginning
      playAudio(currentPlayingNode || 0);
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
    let callbackUrl = `/papers/${paperId}`;
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

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current = null;
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
          <div key={node.globalId} className="mt-4 mb-8 text-center">
            {parseInt(node.paperId) > 0 && (
              <p className="mb-2 text-gray-400">{node.paperTitle}</p>
            )}
            <h1 className="text-5xl font-bold" id={node.globalId}>
              {parseInt(node.paperId) > 0 ? node.paperId : "Foreword"}
            </h1>

            {/* Small - XL Screen TOC */}
            <div className="flex flex-col items-left text-left xl:hidden mt-8">
              <h2
                className={`${
                  tocExpanded ? "text-white" : "text-gray-400"
                } text-sm flex items-center hover:text-white transition-all duration-300 cursor-pointer`}
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
            <h2 className="text-3xl font-bold" id={node.globalId}>
              {node.sectionTitle}
            </h2>
          </div>
        );
      }
      case "paragraph": {
        const bookmark = bookmarks.find(
          (bookmark) => bookmark.globalId === node.globalId
        );
        // Find all notes.
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
                ? "border-l-4 border-white pl-4 -ml-5"
                : ""
            }`}
            id={node.globalId}
            key={node.globalId}
          >
            <div className="text-lg leading-relaxed">
              <div
                className="flex items-center justify-between block text-gray-400 text-sm"
                style={{ minHeight: "28px" }}
              >
                <div className="flex items-center">
                  <span className="flex items-center text-xs">
                    ({node.standardReferenceId})
                  </span>
                </div>
                <div className="flex items-center select-none">
                  <div className="flex items-center mr-2 fade-in">
                    {/* Notes Button */}
                    {status === "authenticated" &&
                      (expandedGlobalId === node.globalId ||
                        notesForNode.length > 0) && (
                        <button
                          className="bg-transparent border-none p-0 m-0 mr-3 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out relative"
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
                        className="bg-transparent border-none p-0 m-0 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
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
                          className="bg-transparent border-none p-0 m-0 ml-4 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
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
                  {expandedGlobalId !== node.globalId && (
                    <button
                      className="bg-transparent border-none p-0 m-0 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
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
                className={`text-xl/9 md:text-lg/8 ${
                  currentPlayingNode &&
                  !isPlayingNode &&
                  (isPlaying || isTransitioning)
                    ? "text-neutral-400"
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

  const deriveAudioContent = (): JSX.Element => {
    if (isPlaying || isTransitioning) {
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
              className="text-gray-400 hover:text-white transition-all duration-300"
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
    <div className="flex flex-col min-h-screen bg-neutral-800 text-white">
      <HeadTag
        metaDescription={`Dive into the depths of ${
          paperIdNumber > 0 ? `Paper ${paperId} - ${paperTitle}` : "Foreword"
        }. Read, listen, and share your thoughts.`}
        titlePrefix={
          paperIdNumber > 0 ? `Paper ${paperId} - ${paperTitle}` : "Foreword"
        }
      />

      <Navbar
        audioContent={deriveAudioContent()}
        audioOnPlay={() =>
          isPlaying || isTransitioning
            ? togglePlayPause()
            : playAudio(currentPlayingNode || 0)
        }
        paperId={paperIdNumber}
        paperTitle={paperTitle}
        showAudio={false}
      />

      {/* Conditional Sign-up Prompt */}
      {status === "unauthenticated" && showSignUpPrompt && (
        // purple box shadow
        <div className="z-10 fixed top-4 left-4 right-4 bg-neutral-900 p-4 rounded-lg text-white text-sm pr-8 max-w-lg mx-auto fade-in shadow-lg shadow-purple-400/20">
          <p>
            Unlock handy features like bookmarking and notes.{" "}
            <button
              className="text-sky-400 hover:underline p-0 m-0 border-none bg-transparent focus:outline-none"
              onClick={onSignUpClick}
              type="button"
            >
              Sign in or create an account
            </button>
          </p>
          <button
            className="absolute top-2 right-2 text-lg bg-transparent border-none p-0 m-0 focus:outline-none text-gray-400 hover:text-white transition duration-300 ease-in-out"
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

      <main className="relative mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        {/* Paper content */}
        <div className="mb-12 subpixel-antialiased">
          {nodes.map((node: UBNode) => renderNode(node))}
        </div>

        {/* Navigation links for previous and next papers */}
        <div className="flex justify-end text-right mb-12">
          {nextPaperId ? (
            <Link
              className="flex text-right text-gray-400 hover:text-white transition duration-300 ease-in-out"
              href={`/papers/${nextPaperId}`}
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
          <div className="hidden rounded-lg xl:flex xl:flex-col fixed top-6 left-6 bg-neutral-700/80 z-10 px-4 py-4 max-w-xs">
            <svg
              className={`w-6 h-6 ${
                tocExpanded ? "-rotate-90" : "rotate-90"
              } absolute top-2 right-2 cursor-pointer`}
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
            className="hidden rounded-lg xl:flex xl:flex-col fixed top-6 left-6 bg-neutral-700/80 z-10 p-2 max-w-xs"
            onClick={() => setTOCExpanded(!tocExpanded)}
          >
            <svg
              className={`w-6 h-6 ${
                tocExpanded ? "-rotate-90" : "rotate-90"
              } cursor-pointer`}
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
  const { paperId } = context.params;

  // const res = await fetch(
  //   `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/api/v1/urantia-book/read?paperId=${paperId}`
  // );
  // const paperData = await res.json();
  const paperData = {
    data: {
      results: [
        {
          globalId: "3:61.-.-",
          htmlText: null,
          labels: ["Paleontology", "Biology", "Science", "History"],
          language: "eng",
          objectID: "3:61.-.-",
          paperId: "61",
          paperSectionId: null,
          paperSectionParagraphId: null,
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: null,
          partId: "3",
          sectionId: null,
          sectionTitle: null,
          sortId: "3.061.000.000",
          standardReferenceId: "61:0.0",
          text: null,
          type: "paper",
          typeRank: 1,
        },
        {
          globalId: "3:61.0.-",
          htmlText: null,
          labels: [],
          language: "eng",
          objectID: "3:61.0.-",
          paperId: "61",
          paperSectionId: "61.0",
          paperSectionParagraphId: null,
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: null,
          partId: "3",
          sectionId: "0",
          sectionTitle: null,
          sortId: "3.061.000.000",
          standardReferenceId: "61:0.0",
          text: null,
          type: "section",
          typeRank: 2,
        },
        {
          globalId: "3:61.0.1",
          htmlText:
            '<span class="urantia-dev-pb-0">THE era of mammals extends from the times of the origin of placental mammals to the end of the ice age, covering a little less than fifty million years.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.0.1",
          paperId: "61",
          paperSectionId: "61.0",
          paperSectionParagraphId: "61.0.1",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "1",
          partId: "3",
          sectionId: "0",
          sectionTitle: null,
          sortId: "3.061.000.001",
          standardReferenceId: "61:0.1",
          text: " THE era of mammals extends from the times of the origin of placental mammals to the end of the ice age, covering a little less than fifty million years.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.0.2",
          htmlText:
            '<span class="urantia-dev-pb-0">During this Cenozoic age the world’s landscape presented an attractive appearance—rolling hills, broad valleys, wide rivers, and great forests. Twice during this sector of time the Panama isthmus went up and down; three times the Bering Strait land bridge did the same. The animal types were both many and varied. The trees swarmed with birds, and the whole world was an animal paradise, notwithstanding the incessant struggle of the evolving animal species for supremacy.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.0.2",
          paperId: "61",
          paperSectionId: "61.0",
          paperSectionParagraphId: "61.0.2",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "2",
          partId: "3",
          sectionId: "0",
          sectionTitle: null,
          sortId: "3.061.000.002",
          standardReferenceId: "61:0.2",
          text: " During this Cenozoic age the world’s landscape presented an attractive appearance—rolling hills, broad valleys, wide rivers, and great forests. Twice during this sector of time the Panama isthmus went up and down; three times the Bering Strait land bridge did the same. The animal types were both many and varied. The trees swarmed with birds, and the whole world was an animal paradise, notwithstanding the incessant struggle of the evolving animal species for supremacy.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.0.3",
          htmlText:
            '<span class="urantia-dev-pb-0">The accumulated deposits of the five periods of this fifty-million-year era contain the fossil records of the successive mammalian dynasties and lead right up through the times of the actual appearance of man himself.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.0.3",
          paperId: "61",
          paperSectionId: "61.0",
          paperSectionParagraphId: "61.0.3",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "3",
          partId: "3",
          sectionId: "0",
          sectionTitle: null,
          sortId: "3.061.000.003",
          standardReferenceId: "61:0.3",
          text: " The accumulated deposits of the five periods of this fifty-million-year era contain the fossil records of the successive mammalian dynasties and lead right up through the times of the actual appearance of man himself.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.-",
          htmlText: null,
          labels: [],
          language: "eng",
          objectID: "3:61.1.-",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: null,
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: null,
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.000",
          standardReferenceId: "61:1.0",
          text: null,
          type: "section",
          typeRank: 2,
        },
        {
          globalId: "3:61.1.1",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>50,000,000</em> years ago the land areas of the world were very generally above water or only slightly submerged. The formations and deposits of this period are both land and marine, but chiefly land. For a considerable time the land gradually rose but was simultaneously washed down to the lower levels and toward the seas.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.1",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.1",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "1",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.001",
          standardReferenceId: "61:1.1",
          text: " 50,000,000 years ago the land areas of the world were very generally above water or only slightly submerged. The formations and deposits of this period are both land and marine, but chiefly land. For a considerable time the land gradually rose but was simultaneously washed down to the lower levels and toward the seas.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.2",
          htmlText:
            '<span class="urantia-dev-pb-0">Early in this period and in North America the placental type of mammals <em>suddenly</em> appeared, and they constituted the most important evolutionary development up to this time. Previous orders of nonplacental mammals had existed, but this new type sprang directly and <em>suddenly</em> from the pre-existent reptilian ancestor whose descendants had persisted on down through the times of dinosaur decline. The father of the placental mammals was a small, highly active, carnivorous, springing type of dinosaur.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.2",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.2",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "2",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.002",
          standardReferenceId: "61:1.2",
          text: " Early in this period and in North America the placental type of mammals suddenly appeared, and they constituted the most important evolutionary development up to this time. Previous orders of nonplacental mammals had existed, but this new type sprang directly and suddenly from the pre-existent reptilian ancestor whose descendants had persisted on down through the times of dinosaur decline. The father of the placental mammals was a small, highly active, carnivorous, springing type of dinosaur.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.3",
          htmlText:
            '<span class="urantia-dev-pb-0">Basic mammalian instincts began to be manifested in these primitive mammalian types. Mammals possess an immense survival advantage over all other forms of animal life in that they can:</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.3",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.3",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "3",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.003",
          standardReferenceId: "61:1.3",
          text: " Basic mammalian instincts began to be manifested in these primitive mammalian types. Mammals possess an immense survival advantage over all other forms of animal life in that they can:",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.4",
          htmlText:
            '<span class="urantia-dev-pb-0">1. Bring forth relatively mature and well-developed offspring.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.4",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.4",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "4",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.004",
          standardReferenceId: "61:1.4",
          text: " 1. Bring forth relatively mature and well-developed offspring.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.5",
          htmlText:
            '<span class="urantia-dev-pb-0">2. Nourish, nurture, and protect their offspring with affectionate regard.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.5",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.5",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "5",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.005",
          standardReferenceId: "61:1.5",
          text: " 2. Nourish, nurture, and protect their offspring with affectionate regard.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.6",
          htmlText:
            '<span class="urantia-dev-pb-0">3. Employ their superior brain power in self-perpetuation.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.6",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.6",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "6",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.006",
          standardReferenceId: "61:1.6",
          text: " 3. Employ their superior brain power in self-perpetuation.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.7",
          htmlText:
            '<span class="urantia-dev-pb-0">4. Utilize increased agility in escaping from enemies.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.7",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.7",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "7",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.007",
          standardReferenceId: "61:1.7",
          text: " 4. Utilize increased agility in escaping from enemies.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.8",
          htmlText:
            '<span class="urantia-dev-pb-4">5. Apply superior intelligence to environmental adjustment and adaptation.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.8",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.8",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "8",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.008",
          standardReferenceId: "61:1.8",
          text: " 5. Apply superior intelligence to environmental adjustment and adaptation.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.9",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>45,000,000</em> years ago the continental backbones were elevated in association with a very general sinking of the coast lines. Mammalian life was evolving rapidly. A small reptilian, egg-laying type of mammal flourished, and the ancestors of the later kangaroos roamed Australia. Soon there were small horses, fleet-footed rhinoceroses, tapirs with proboscises, primitive pigs, squirrels, lemurs, opossums, and several tribes of monkeylike animals. They were all small, primitive, and best suited to living among the forests of the mountain regions. A large ostrichlike land bird developed to a height of ten feet and laid an egg nine by thirteen inches. These were the ancestors of the later gigantic passenger birds that were so highly intelligent, and that onetime transported human beings through the air.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.9",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.9",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "9",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.009",
          standardReferenceId: "61:1.9",
          text: " 45,000,000 years ago the continental backbones were elevated in association with a very general sinking of the coast lines. Mammalian life was evolving rapidly. A small reptilian, egg-laying type of mammal flourished, and the ancestors of the later kangaroos roamed Australia. Soon there were small horses, fleet-footed rhinoceroses, tapirs with proboscises, primitive pigs, squirrels, lemurs, opossums, and several tribes of monkeylike animals. They were all small, primitive, and best suited to living among the forests of the mountain regions. A large ostrichlike land bird developed to a height of ten feet and laid an egg nine by thirteen inches. These were the ancestors of the later gigantic passenger birds that were so highly intelligent, and that onetime transported human beings through the air.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.10",
          htmlText:
            '<span class="urantia-dev-pb-4">The mammals of the early Cenozoic lived on land, under the water, in the air, and among the treetops. They had from one to eleven pairs of mammary glands, and all were covered with considerable hair. In common with the later appearing orders, they developed two successive sets of teeth and possessed large brains in comparison to body size. But among them all no modern forms existed.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.10",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.10",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "10",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.010",
          standardReferenceId: "61:1.10",
          text: " The mammals of the early Cenozoic lived on land, under the water, in the air, and among the treetops. They had from one to eleven pairs of mammary glands, and all were covered with considerable hair. In common with the later appearing orders, they developed two successive sets of teeth and possessed large brains in comparison to body size. But among them all no modern forms existed.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.11",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>40,000,000</em> years ago the land areas of the Northern Hemisphere began to elevate, and this was followed by new extensive land deposits and other terrestrial activities, including lava flows, warping, lake formation, and erosion.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.11",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.11",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "11",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.011",
          standardReferenceId: "61:1.11",
          text: " 40,000,000 years ago the land areas of the Northern Hemisphere began to elevate, and this was followed by new extensive land deposits and other terrestrial activities, including lava flows, warping, lake formation, and erosion.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.12",
          htmlText:
            '<span class="urantia-dev-pb-0">During the latter part of this epoch most of Europe was submerged. Following a slight land rise the continent was covered by lakes and bays. The Arctic Ocean, through the Ural depression, ran south to connect with the Mediterranean Sea as it was then expanded northward, the highlands of the Alps, Carpathians, Apennines, and Pyrenees being up above the water as islands of the sea. The Isthmus of Panama was up; the Atlantic and Pacific Oceans were separated. North America was connected with Asia by the Bering Strait land bridge and with Europe by way of Greenland and Iceland. The earth circuit of land in northern latitudes was broken only by the Ural Straits, which connected the arctic seas with the enlarged Mediterranean.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.12",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.12",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "12",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.012",
          standardReferenceId: "61:1.12",
          text: " During the latter part of this epoch most of Europe was submerged. Following a slight land rise the continent was covered by lakes and bays. The Arctic Ocean, through the Ural depression, ran south to connect with the Mediterranean Sea as it was then expanded northward, the highlands of the Alps, Carpathians, Apennines, and Pyrenees being up above the water as islands of the sea. The Isthmus of Panama was up; the Atlantic and Pacific Oceans were separated. North America was connected with Asia by the Bering Strait land bridge and with Europe by way of Greenland and Iceland. The earth circuit of land in northern latitudes was broken only by the Ural Straits, which connected the arctic seas with the enlarged Mediterranean.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.13",
          htmlText:
            '<span class="urantia-dev-pb-4">Considerable foraminiferal limestone was deposited in European waters. Today this same stone is elevated to a height of 10,000 feet in the Alps, 16,000 feet in the Himalayas, and 20,000 feet in Tibet. The chalk deposits of this period are found along the coasts of Africa and Australia, on the west coast of South America, and about the West Indies.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.13",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.13",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "13",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.013",
          standardReferenceId: "61:1.13",
          text: " Considerable foraminiferal limestone was deposited in European waters. Today this same stone is elevated to a height of 10,000 feet in the Alps, 16,000 feet in the Himalayas, and 20,000 feet in Tibet. The chalk deposits of this period are found along the coasts of Africa and Australia, on the west coast of South America, and about the West Indies.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.1.14",
          htmlText:
            '<span class="urantia-dev-pb-0">Throughout this so-called <em>Eocene</em> period the evolution of mammalian and other related forms of life continued with little or no interruption. North America was then connected by land with every continent except Australia, and the world was gradually overrun by primitive mammalian fauna of various types.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.1.14",
          paperId: "61",
          paperSectionId: "61.1",
          paperSectionParagraphId: "61.1.14",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "14",
          partId: "3",
          sectionId: "1",
          sectionTitle:
            "The New Continental Land Stage The Age of Early Mammals",
          sortId: "3.061.001.014",
          standardReferenceId: "61:1.14",
          text: " Throughout this so-called Eocene period the evolution of mammalian and other related forms of life continued with little or no interruption. North America was then connected by land with every continent except Australia, and the world was gradually overrun by primitive mammalian fauna of various types.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.2.-",
          htmlText: null,
          labels: [],
          language: "eng",
          objectID: "3:61.2.-",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: null,
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: null,
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.000",
          standardReferenceId: "61:2.0",
          text: null,
          type: "section",
          typeRank: 2,
        },
        {
          globalId: "3:61.2.1",
          htmlText:
            '<span class="urantia-dev-pb-0">This period was characterized by the further and rapid evolution of placental mammals, the more progressive forms of mammalian life developing during these times.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.2.1",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: "61.2.1",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "1",
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.001",
          standardReferenceId: "61:2.1",
          text: " This period was characterized by the further and rapid evolution of placental mammals, the more progressive forms of mammalian life developing during these times.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.2.2",
          htmlText:
            '<span class="urantia-dev-pb-4">Although the early placental mammals sprang from carnivorous ancestors, very soon herbivorous branches developed, and, erelong, omnivorous mammalian families also sprang up. The angiosperms were the principal food of the rapidly increasing mammals, the modern land flora, including the majority of present-day plants and trees, having appeared during earlier periods.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.2.2",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: "61.2.2",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "2",
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.002",
          standardReferenceId: "61:2.2",
          text: " Although the early placental mammals sprang from carnivorous ancestors, very soon herbivorous branches developed, and, erelong, omnivorous mammalian families also sprang up. The angiosperms were the principal food of the rapidly increasing mammals, the modern land flora, including the majority of present-day plants and trees, having appeared during earlier periods.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.2.3",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>35,000,000</em> years ago marks the beginning of the age of placental-mammalian world domination. The southern land bridge was extensive, reconnecting the then enormous Antarctic continent with South America, South Africa, and Australia. In spite of the massing of land in high latitudes, the world climate remained relatively mild because of the enormous increase in the size of the tropic seas, nor was the land elevated sufficiently to produce glaciers. Extensive lava flows occurred in Greenland and Iceland, some coal being deposited between these layers.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.2.3",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: "61.2.3",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "3",
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.003",
          standardReferenceId: "61:2.3",
          text: " 35,000,000 years ago marks the beginning of the age of placental-mammalian world domination. The southern land bridge was extensive, reconnecting the then enormous Antarctic continent with South America, South Africa, and Australia. In spite of the massing of land in high latitudes, the world climate remained relatively mild because of the enormous increase in the size of the tropic seas, nor was the land elevated sufficiently to produce glaciers. Extensive lava flows occurred in Greenland and Iceland, some coal being deposited between these layers.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.2.4",
          htmlText:
            '<span class="urantia-dev-pb-0">Marked changes were taking place in the fauna of the planet. The sea life was undergoing great modification; most of the present-day orders of marine life were in existence, and foraminifers continued to play an important role. The insect life was much like that of the previous era. The Florissant fossil beds of Colorado belong to the later years of these far-distant times. Most of the living insect families go back to this period, but many then in existence are now extinct, though their fossils remain.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.2.4",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: "61.2.4",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "4",
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.004",
          standardReferenceId: "61:2.4",
          text: " Marked changes were taking place in the fauna of the planet. The sea life was undergoing great modification; most of the present-day orders of marine life were in existence, and foraminifers continued to play an important role. The insect life was much like that of the previous era. The Florissant fossil beds of Colorado belong to the later years of these far-distant times. Most of the living insect families go back to this period, but many then in existence are now extinct, though their fossils remain.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.2.5",
          htmlText:
            '<span class="urantia-dev-pb-0">On land this was pre-eminently the age of mammalian renovation and expansion. Of the earlier and more primitive mammals, over one hundred species were extinct before this period ended. Even the mammals of large size and small brain soon perished. Brains and agility had replaced armor and size in the progress of animal survival. And with the dinosaur family on the decline, the mammals slowly assumed domination of the earth, speedily and completely destroying the remainder of their reptilian ancestors.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.2.5",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: "61.2.5",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "5",
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.005",
          standardReferenceId: "61:2.5",
          text: " On land this was pre-eminently the age of mammalian renovation and expansion. Of the earlier and more primitive mammals, over one hundred species were extinct before this period ended. Even the mammals of large size and small brain soon perished. Brains and agility had replaced armor and size in the progress of animal survival. And with the dinosaur family on the decline, the mammals slowly assumed domination of the earth, speedily and completely destroying the remainder of their reptilian ancestors.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.2.6",
          htmlText:
            '<span class="urantia-dev-pb-0">Along with the disappearance of the dinosaurs, other and great changes occurred in the various branches of the saurian family. The surviving members of the early reptilian families are turtles, snakes, and crocodiles, together with the venerable frog, the only remaining group representative of man’s earlier ancestors.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.2.6",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: "61.2.6",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "6",
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.006",
          standardReferenceId: "61:2.6",
          text: " Along with the disappearance of the dinosaurs, other and great changes occurred in the various branches of the saurian family. The surviving members of the early reptilian families are turtles, snakes, and crocodiles, together with the venerable frog, the only remaining group representative of man’s earlier ancestors.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.2.7",
          htmlText:
            '<span class="urantia-dev-pb-4">Various groups of mammals had their origin in a unique animal now extinct. This carnivorous creature was something of a cross between a cat and a seal; it could live on land or in water and was highly intelligent and very active. In Europe the ancestor of the canine family evolved, soon giving rise to many species of small dogs. About the same time the gnawing rodents, including beavers, squirrels, gophers, mice, and rabbits, appeared and soon became a notable form of life, very little change having since occurred in this family. The later deposits of this period contain the fossil remains of dogs, cats, coons, and weasels in ancestral form.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.2.7",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: "61.2.7",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "7",
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.007",
          standardReferenceId: "61:2.7",
          text: " Various groups of mammals had their origin in a unique animal now extinct. This carnivorous creature was something of a cross between a cat and a seal; it could live on land or in water and was highly intelligent and very active. In Europe the ancestor of the canine family evolved, soon giving rise to many species of small dogs. About the same time the gnawing rodents, including beavers, squirrels, gophers, mice, and rabbits, appeared and soon became a notable form of life, very little change having since occurred in this family. The later deposits of this period contain the fossil remains of dogs, cats, coons, and weasels in ancestral form.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.2.8",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>30,000,000</em> years ago the modern types of mammals began to make their appearance. Formerly the mammals had lived for the greater part in the hills, being of the mountainous types; <em>suddenly</em> there began the evolution of the plains or hoofed type, the grazing species, as differentiated from the clawed flesh eaters. These grazers sprang from an undifferentiated ancestor having five toes and forty-four teeth, which perished before the end of the age. Toe evolution did not progress beyond the three-toed stage throughout this period.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.2.8",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: "61.2.8",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "8",
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.008",
          standardReferenceId: "61:2.8",
          text: " 30,000,000 years ago the modern types of mammals began to make their appearance. Formerly the mammals had lived for the greater part in the hills, being of the mountainous types; suddenly there began the evolution of the plains or hoofed type, the grazing species, as differentiated from the clawed flesh eaters. These grazers sprang from an undifferentiated ancestor having five toes and forty-four teeth, which perished before the end of the age. Toe evolution did not progress beyond the three-toed stage throughout this period.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.2.9",
          htmlText:
            '<span class="urantia-dev-pb-0">The horse, an outstanding example of evolution, lived during these times in both North America and Europe, though his development was not fully completed until the later ice age. While the rhinoceros family appeared at the close of this period, it underwent its greatest expansion subsequently. A small hoglike creature also developed which became the ancestor of the many species of swine, peccaries, and hippopotamuses. Camels and llamas had their origin in North America about the middle of this period and overran the western plains. Later, the llamas migrated to South America, the camels to Europe, and soon both were extinct in North America, though a few camels survived up to the ice age.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.2.9",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: "61.2.9",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "9",
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.009",
          standardReferenceId: "61:2.9",
          text: " The horse, an outstanding example of evolution, lived during these times in both North America and Europe, though his development was not fully completed until the later ice age. While the rhinoceros family appeared at the close of this period, it underwent its greatest expansion subsequently. A small hoglike creature also developed which became the ancestor of the many species of swine, peccaries, and hippopotamuses. Camels and llamas had their origin in North America about the middle of this period and overran the western plains. Later, the llamas migrated to South America, the camels to Europe, and soon both were extinct in North America, though a few camels survived up to the ice age.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.2.10",
          htmlText:
            '<span class="urantia-dev-pb-0">About this time a notable thing occurred in western North America: The early ancestors of the ancient lemurs first made their appearance. While this family cannot be regarded as true lemurs, their coming marked the establishment of the line from which the true lemurs subsequently sprang.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.2.10",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: "61.2.10",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "10",
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.010",
          standardReferenceId: "61:2.10",
          text: " About this time a notable thing occurred in western North America: The early ancestors of the ancient lemurs first made their appearance. While this family cannot be regarded as true lemurs, their coming marked the establishment of the line from which the true lemurs subsequently sprang.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.2.11",
          htmlText:
            '<span class="urantia-dev-pb-0">Like the land serpents of a previous age which betook themselves to the seas, now a whole tribe of placental mammals deserted the land and took up their residence in the oceans. And they have ever since remained in the sea, yielding the modern whales, dolphins, porpoises, seals, and sea lions.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.2.11",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: "61.2.11",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "11",
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.011",
          standardReferenceId: "61:2.11",
          text: " Like the land serpents of a previous age which betook themselves to the seas, now a whole tribe of placental mammals deserted the land and took up their residence in the oceans. And they have ever since remained in the sea, yielding the modern whales, dolphins, porpoises, seals, and sea lions.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.2.12",
          htmlText:
            '<span class="urantia-dev-pb-4">The bird life of the planet continued to develop, but with few important evolutionary changes. The majority of modern birds were existent, including gulls, herons, flamingoes, buzzards, falcons, eagles, owls, quails, and ostriches.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.2.12",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: "61.2.12",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "12",
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.012",
          standardReferenceId: "61:2.12",
          text: " The bird life of the planet continued to develop, but with few important evolutionary changes. The majority of modern birds were existent, including gulls, herons, flamingoes, buzzards, falcons, eagles, owls, quails, and ostriches.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.2.13",
          htmlText:
            '<span class="urantia-dev-pb-0">By the close of this <em>Oligocene</em> period, covering ten million years, the plant life, together with the marine life and the land animals, had very largely evolved and was present on earth much as today. Considerable specialization has subsequently appeared, but the ancestral forms of most living things were then alive.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.2.13",
          paperId: "61",
          paperSectionId: "61.2",
          paperSectionParagraphId: "61.2.13",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "13",
          partId: "3",
          sectionId: "2",
          sectionTitle: "The Recent Flood StageThe Age of Advanced Mammals",
          sortId: "3.061.002.013",
          standardReferenceId: "61:2.13",
          text: " By the close of this Oligocene period, covering ten million years, the plant life, together with the marine life and the land animals, had very largely evolved and was present on earth much as today. Considerable specialization has subsequently appeared, but the ancestral forms of most living things were then alive.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.-",
          htmlText: null,
          labels: [],
          language: "eng",
          objectID: "3:61.3.-",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: null,
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: null,
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.000",
          standardReferenceId: "61:3.0",
          text: null,
          type: "section",
          typeRank: 2,
        },
        {
          globalId: "3:61.3.1",
          htmlText:
            '<span class="urantia-dev-pb-0">Land elevation and sea segregation were slowly changing the world’s weather, gradually cooling it, but the climate was still mild. Sequoias and magnolias grew in Greenland, but the subtropical plants were beginning to migrate southward. By the end of this period these warm-climate plants and trees had largely disappeared from the northern latitudes, their places being taken by more hardy plants and the deciduous trees.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.1",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.1",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "1",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.001",
          standardReferenceId: "61:3.1",
          text: " Land elevation and sea segregation were slowly changing the world’s weather, gradually cooling it, but the climate was still mild. Sequoias and magnolias grew in Greenland, but the subtropical plants were beginning to migrate southward. By the end of this period these warm-climate plants and trees had largely disappeared from the northern latitudes, their places being taken by more hardy plants and the deciduous trees.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.2",
          htmlText:
            '<span class="urantia-dev-pb-4">There was a great increase in the varieties of grasses, and the teeth of many mammalian species gradually altered to conform to the present-day grazing type.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.2",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.2",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "2",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.002",
          standardReferenceId: "61:3.2",
          text: " There was a great increase in the varieties of grasses, and the teeth of many mammalian species gradually altered to conform to the present-day grazing type.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.3",
          htmlText:
            '<span class="urantia-dev-pb-4"><em>25,000,000</em> years ago there was a slight land submergence following the long epoch of land elevation. The Rocky Mountain region remained highly elevated so that the deposition of erosion material continued throughout the lowlands to the east. The Sierras were well re-elevated; in fact, they have been rising ever since. The great four-mile vertical fault in the California region dates from this time.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.3",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.3",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "3",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.003",
          standardReferenceId: "61:3.3",
          text: " 25,000,000 years ago there was a slight land submergence following the long epoch of land elevation. The Rocky Mountain region remained highly elevated so that the deposition of erosion material continued throughout the lowlands to the east. The Sierras were well re-elevated; in fact, they have been rising ever since. The great four-mile vertical fault in the California region dates from this time.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.4",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>20,000,000</em> years ago was indeed the golden age of mammals. The Bering Strait land bridge was up, and many groups of animals migrated to North America from Asia, including the four-tusked mastodons, short-legged rhinoceroses, and many varieties of the cat family.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.4",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.4",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "4",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.004",
          standardReferenceId: "61:3.4",
          text: " 20,000,000 years ago was indeed the golden age of mammals. The Bering Strait land bridge was up, and many groups of animals migrated to North America from Asia, including the four-tusked mastodons, short-legged rhinoceroses, and many varieties of the cat family.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.5",
          htmlText:
            '<span class="urantia-dev-pb-0">The first deer appeared, and North America was soon overrun by ruminants—deer, oxen, camels, bison, and several species of rhinoceroses—but the giant pigs, more than six feet tall, became extinct.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.5",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.5",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "5",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.005",
          standardReferenceId: "61:3.5",
          text: " The first deer appeared, and North America was soon overrun by ruminants—deer, oxen, camels, bison, and several species of rhinoceroses—but the giant pigs, more than six feet tall, became extinct.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.6",
          htmlText:
            '<span class="urantia-dev-pb-4">The huge elephants of this and subsequent periods possessed large brains as well as large bodies, and they soon overran the entire world except Australia. For once the world was dominated by a huge animal with a brain sufficiently large to enable it to carry on. Confronted by the highly intelligent life of these ages, no animal the size of an elephant could have survived unless it had possessed a brain of large size and superior quality. In intelligence and adaptation the elephant is approached only by the horse and is surpassed only by man himself. Even so, of the fifty species of elephants in existence at the opening of this period, only two have survived.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.6",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.6",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "6",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.006",
          standardReferenceId: "61:3.6",
          text: " The huge elephants of this and subsequent periods possessed large brains as well as large bodies, and they soon overran the entire world except Australia. For once the world was dominated by a huge animal with a brain sufficiently large to enable it to carry on. Confronted by the highly intelligent life of these ages, no animal the size of an elephant could have survived unless it had possessed a brain of large size and superior quality. In intelligence and adaptation the elephant is approached only by the horse and is surpassed only by man himself. Even so, of the fifty species of elephants in existence at the opening of this period, only two have survived.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.7",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>15,000,000</em> years ago the mountain regions of Eurasia were rising, and there was some volcanic activity throughout these regions, but nothing comparable to the lava flows of the Western Hemisphere. These unsettled conditions prevailed all over the world.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.7",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.7",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "7",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.007",
          standardReferenceId: "61:3.7",
          text: " 15,000,000 years ago the mountain regions of Eurasia were rising, and there was some volcanic activity throughout these regions, but nothing comparable to the lava flows of the Western Hemisphere. These unsettled conditions prevailed all over the world.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.8",
          htmlText:
            '<span class="urantia-dev-pb-0">The Strait of Gibraltar closed, and Spain was connected with Africa by the old land bridge, but the Mediterranean flowed into the Atlantic through a narrow channel which extended across France, the mountain peaks and highlands appearing as islands above this ancient sea. Later on, these European seas began to withdraw. Still later, the Mediterranean was connected with the Indian Ocean, while at the close of this period the Suez region was elevated so that the Mediterranean became, for a time, an inland salt sea.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.8",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.8",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "8",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.008",
          standardReferenceId: "61:3.8",
          text: " The Strait of Gibraltar closed, and Spain was connected with Africa by the old land bridge, but the Mediterranean flowed into the Atlantic through a narrow channel which extended across France, the mountain peaks and highlands appearing as islands above this ancient sea. Later on, these European seas began to withdraw. Still later, the Mediterranean was connected with the Indian Ocean, while at the close of this period the Suez region was elevated so that the Mediterranean became, for a time, an inland salt sea.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.9",
          htmlText:
            '<span class="urantia-dev-pb-0">The Iceland land bridge submerged, and the arctic waters commingled with those of the Atlantic Ocean. The Atlantic coast of North America rapidly cooled, but the Pacific coast remained warmer than at present. The great ocean currents were in function and affected climate much as they do today.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.9",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.9",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "9",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.009",
          standardReferenceId: "61:3.9",
          text: " The Iceland land bridge submerged, and the arctic waters commingled with those of the Atlantic Ocean. The Atlantic coast of North America rapidly cooled, but the Pacific coast remained warmer than at present. The great ocean currents were in function and affected climate much as they do today.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.10",
          htmlText:
            '<span class="urantia-dev-pb-4">Mammalian life continued to evolve. Enormous herds of horses joined the camels on the western plains of North America; this was truly the age of horses as well as of elephants. The horse’s brain is next in animal quality to that of the elephant, but in one respect it is decidedly inferior, for the horse never fully overcame the deep-seated propensity to flee when frightened. The horse lacks the emotional control of the elephant, while the elephant is greatly handicapped by size and lack of agility. During this period an animal evolved which was somewhat like both the elephant and the horse, but it was soon destroyed by the rapidly increasing cat family.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.10",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.10",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "10",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.010",
          standardReferenceId: "61:3.10",
          text: " Mammalian life continued to evolve. Enormous herds of horses joined the camels on the western plains of North America; this was truly the age of horses as well as of elephants. The horse’s brain is next in animal quality to that of the elephant, but in one respect it is decidedly inferior, for the horse never fully overcame the deep-seated propensity to flee when frightened. The horse lacks the emotional control of the elephant, while the elephant is greatly handicapped by size and lack of agility. During this period an animal evolved which was somewhat like both the elephant and the horse, but it was soon destroyed by the rapidly increasing cat family.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.11",
          htmlText:
            '<span class="urantia-dev-pb-4">As Urantia is entering the so-called “horseless age,” you should pause and ponder what this animal meant to your ancestors. Men first used horses for food, then for travel, and later in agriculture and war. The horse has long served mankind and has played an important part in the development of human civilization.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.11",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.11",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "11",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.011",
          standardReferenceId: "61:3.11",
          text: " As Urantia is entering the so-called “horseless age,” you should pause and ponder what this animal meant to your ancestors. Men first used horses for food, then for travel, and later in agriculture and war. The horse has long served mankind and has played an important part in the development of human civilization.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.12",
          htmlText:
            '<span class="urantia-dev-pb-0">The biologic developments of this period contributed much toward the setting of the stage for the subsequent appearance of man. In central Asia the true types of both the primitive monkey and the gorilla evolved, having a common ancestor, now extinct. But neither of these species is concerned in the line of living beings which were, later on, to become the ancestors of the human race.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.12",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.12",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "12",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.012",
          standardReferenceId: "61:3.12",
          text: " The biologic developments of this period contributed much toward the setting of the stage for the subsequent appearance of man. In central Asia the true types of both the primitive monkey and the gorilla evolved, having a common ancestor, now extinct. But neither of these species is concerned in the line of living beings which were, later on, to become the ancestors of the human race.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.13",
          htmlText:
            '<span class="urantia-dev-pb-0">The dog family was represented by several groups, notably wolves and foxes; the cat tribe, by panthers and large saber-toothed tigers, the latter first evolving in North America. The modern cat and dog families increased in numbers all over the world. Weasels, martens, otters, and raccoons thrived and developed throughout the northern latitudes.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.13",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.13",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "13",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.013",
          standardReferenceId: "61:3.13",
          text: " The dog family was represented by several groups, notably wolves and foxes; the cat tribe, by panthers and large saber-toothed tigers, the latter first evolving in North America. The modern cat and dog families increased in numbers all over the world. Weasels, martens, otters, and raccoons thrived and developed throughout the northern latitudes.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.14",
          htmlText:
            '<span class="urantia-dev-pb-4">Birds continued to evolve, though few marked changes occurred. Reptiles were similar to modern types—snakes, crocodiles, and turtles.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.14",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.14",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "14",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.014",
          standardReferenceId: "61:3.14",
          text: " Birds continued to evolve, though few marked changes occurred. Reptiles were similar to modern types—snakes, crocodiles, and turtles.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.3.15",
          htmlText:
            '<span class="urantia-dev-pb-0">Thus drew to a close a very eventful and interesting period of the world’s history. This age of the elephant and the horse is known as the <em>Miocene.</em></span>',
          labels: [],
          language: "eng",
          objectID: "3:61.3.15",
          paperId: "61",
          paperSectionId: "61.3",
          paperSectionParagraphId: "61.3.15",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "15",
          partId: "3",
          sectionId: "3",
          sectionTitle:
            "The Modern Mountain StageAge of the Elephant and the Horse",
          sortId: "3.061.003.015",
          standardReferenceId: "61:3.15",
          text: " Thus drew to a close a very eventful and interesting period of the world’s history. This age of the elephant and the horse is known as the Miocene.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.4.-",
          htmlText: null,
          labels: [],
          language: "eng",
          objectID: "3:61.4.-",
          paperId: "61",
          paperSectionId: "61.4",
          paperSectionParagraphId: null,
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: null,
          partId: "3",
          sectionId: "4",
          sectionTitle:
            "The Recent Continental-Elevation StageThe Last Great Mammalian Migration",
          sortId: "3.061.004.000",
          standardReferenceId: "61:4.0",
          text: null,
          type: "section",
          typeRank: 2,
        },
        {
          globalId: "3:61.4.1",
          htmlText:
            '<span class="urantia-dev-pb-4">This is the period of preglacial land elevation in North America, Europe, and Asia. The land was greatly altered in topography. Mountain ranges were born, streams changed their courses, and isolated volcanoes broke out all over the world.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.4.1",
          paperId: "61",
          paperSectionId: "61.4",
          paperSectionParagraphId: "61.4.1",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "1",
          partId: "3",
          sectionId: "4",
          sectionTitle:
            "The Recent Continental-Elevation StageThe Last Great Mammalian Migration",
          sortId: "3.061.004.001",
          standardReferenceId: "61:4.1",
          text: " This is the period of preglacial land elevation in North America, Europe, and Asia. The land was greatly altered in topography. Mountain ranges were born, streams changed their courses, and isolated volcanoes broke out all over the world.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.4.2",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>10,000,000</em> years ago began an age of widespread local land deposits on the lowlands of the continents, but most of these sedimentations were later removed. Much of Europe, at this time, was still under water, including parts of England, Belgium, and France, and the Mediterranean Sea covered much of northern Africa. In North America extensive depositions were made at the mountain bases, in lakes, and in the great land basins. These deposits average only about two hundred feet, are more or less colored, and fossils are rare. Two great fresh-water lakes existed in western North America. The Sierras were elevating; Shasta, Hood, and Rainier were beginning their mountain careers. But it was not until the subsequent ice age that North America began its creep toward the Atlantic depression.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.4.2",
          paperId: "61",
          paperSectionId: "61.4",
          paperSectionParagraphId: "61.4.2",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "2",
          partId: "3",
          sectionId: "4",
          sectionTitle:
            "The Recent Continental-Elevation StageThe Last Great Mammalian Migration",
          sortId: "3.061.004.002",
          standardReferenceId: "61:4.2",
          text: " 10,000,000 years ago began an age of widespread local land deposits on the lowlands of the continents, but most of these sedimentations were later removed. Much of Europe, at this time, was still under water, including parts of England, Belgium, and France, and the Mediterranean Sea covered much of northern Africa. In North America extensive depositions were made at the mountain bases, in lakes, and in the great land basins. These deposits average only about two hundred feet, are more or less colored, and fossils are rare. Two great fresh-water lakes existed in western North America. The Sierras were elevating; Shasta, Hood, and Rainier were beginning their mountain careers. But it was not until the subsequent ice age that North America began its creep toward the Atlantic depression.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.4.3",
          htmlText:
            '<span class="urantia-dev-pb-0">For a short time all the land of the world was again joined excepting Australia, and the last great world-wide animal migration took place. North America was connected with both South America and Asia, and there was a free exchange of animal life. Asiatic sloths, armadillos, antelopes, and bears entered North America, while North American camels went to China. Rhinoceroses migrated over the whole world except Australia and South America, but they were extinct in the Western Hemisphere by the close of this period.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.4.3",
          paperId: "61",
          paperSectionId: "61.4",
          paperSectionParagraphId: "61.4.3",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "3",
          partId: "3",
          sectionId: "4",
          sectionTitle:
            "The Recent Continental-Elevation StageThe Last Great Mammalian Migration",
          sortId: "3.061.004.003",
          standardReferenceId: "61:4.3",
          text: " For a short time all the land of the world was again joined excepting Australia, and the last great world-wide animal migration took place. North America was connected with both South America and Asia, and there was a free exchange of animal life. Asiatic sloths, armadillos, antelopes, and bears entered North America, while North American camels went to China. Rhinoceroses migrated over the whole world except Australia and South America, but they were extinct in the Western Hemisphere by the close of this period.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.4.4",
          htmlText:
            '<span class="urantia-dev-pb-4">In general, the life of the preceding period continued to evolve and spread. The cat family dominated the animal life, and marine life was almost at a standstill. Many of the horses were still three-toed, but the modern types were arriving; llamas and giraffelike camels mingled with the horses on the grazing plains. The giraffe appeared in Africa, having just as long a neck then as now. In South America sloths, armadillos, anteaters, and the South American type of primitive monkeys evolved. Before the continents were finally isolated, those massive animals, the mastodons, migrated everywhere except to Australia.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.4.4",
          paperId: "61",
          paperSectionId: "61.4",
          paperSectionParagraphId: "61.4.4",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "4",
          partId: "3",
          sectionId: "4",
          sectionTitle:
            "The Recent Continental-Elevation StageThe Last Great Mammalian Migration",
          sortId: "3.061.004.004",
          standardReferenceId: "61:4.4",
          text: " In general, the life of the preceding period continued to evolve and spread. The cat family dominated the animal life, and marine life was almost at a standstill. Many of the horses were still three-toed, but the modern types were arriving; llamas and giraffelike camels mingled with the horses on the grazing plains. The giraffe appeared in Africa, having just as long a neck then as now. In South America sloths, armadillos, anteaters, and the South American type of primitive monkeys evolved. Before the continents were finally isolated, those massive animals, the mastodons, migrated everywhere except to Australia.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.4.5",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>5,000,000</em> years ago the horse evolved as it now is and from North America migrated to all the world. But the horse had become extinct on the continent of its origin long before the red man arrived.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.4.5",
          paperId: "61",
          paperSectionId: "61.4",
          paperSectionParagraphId: "61.4.5",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "5",
          partId: "3",
          sectionId: "4",
          sectionTitle:
            "The Recent Continental-Elevation StageThe Last Great Mammalian Migration",
          sortId: "3.061.004.005",
          standardReferenceId: "61:4.5",
          text: " 5,000,000 years ago the horse evolved as it now is and from North America migrated to all the world. But the horse had become extinct on the continent of its origin long before the red man arrived.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.4.6",
          htmlText:
            '<span class="urantia-dev-pb-4">The climate was gradually getting cooler; the land plants were slowly moving southward. At first it was the increasing cold in the north that stopped animal migrations over the northern isthmuses; subsequently these North American land bridges went down. Soon afterwards the land connection between Africa and South America finally submerged, and the Western Hemisphere was isolated much as it is today. From this time forward distinct types of life began to develop in the Eastern and Western Hemispheres.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.4.6",
          paperId: "61",
          paperSectionId: "61.4",
          paperSectionParagraphId: "61.4.6",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "6",
          partId: "3",
          sectionId: "4",
          sectionTitle:
            "The Recent Continental-Elevation StageThe Last Great Mammalian Migration",
          sortId: "3.061.004.006",
          standardReferenceId: "61:4.6",
          text: " The climate was gradually getting cooler; the land plants were slowly moving southward. At first it was the increasing cold in the north that stopped animal migrations over the northern isthmuses; subsequently these North American land bridges went down. Soon afterwards the land connection between Africa and South America finally submerged, and the Western Hemisphere was isolated much as it is today. From this time forward distinct types of life began to develop in the Eastern and Western Hemispheres.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.4.7",
          htmlText:
            '<span class="urantia-dev-pb-0">And thus does this period of almost ten million years’ duration draw to a close, and not yet has the ancestor of man appeared. This is the time usually designated as the <em>Pliocene.</em></span>',
          labels: [],
          language: "eng",
          objectID: "3:61.4.7",
          paperId: "61",
          paperSectionId: "61.4",
          paperSectionParagraphId: "61.4.7",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "7",
          partId: "3",
          sectionId: "4",
          sectionTitle:
            "The Recent Continental-Elevation StageThe Last Great Mammalian Migration",
          sortId: "3.061.004.007",
          standardReferenceId: "61:4.7",
          text: " And thus does this period of almost ten million years’ duration draw to a close, and not yet has the ancestor of man appeared. This is the time usually designated as the Pliocene.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.5.-",
          htmlText: null,
          labels: [],
          language: "eng",
          objectID: "3:61.5.-",
          paperId: "61",
          paperSectionId: "61.5",
          paperSectionParagraphId: null,
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: null,
          partId: "3",
          sectionId: "5",
          sectionTitle: "The Early Ice Age",
          sortId: "3.061.005.000",
          standardReferenceId: "61:5.0",
          text: null,
          type: "section",
          typeRank: 2,
        },
        {
          globalId: "3:61.5.1",
          htmlText:
            '<span class="urantia-dev-pb-0">By the close of the preceding period the lands of the northeastern part of North America and of northern Europe were highly elevated on an extensive scale, in North America vast areas rising up to 30,000 feet and more. Mild climates had formerly prevailed over these northern regions, and the arctic waters were all open to evaporation, and they continued to be ice-free until almost the close of the glacial period.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.5.1",
          paperId: "61",
          paperSectionId: "61.5",
          paperSectionParagraphId: "61.5.1",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "1",
          partId: "3",
          sectionId: "5",
          sectionTitle: "The Early Ice Age",
          sortId: "3.061.005.001",
          standardReferenceId: "61:5.1",
          text: " By the close of the preceding period the lands of the northeastern part of North America and of northern Europe were highly elevated on an extensive scale, in North America vast areas rising up to 30,000 feet and more. Mild climates had formerly prevailed over these northern regions, and the arctic waters were all open to evaporation, and they continued to be ice-free until almost the close of the glacial period.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.5.2",
          htmlText:
            '<span class="urantia-dev-pb-0">Simultaneously with these land elevations the ocean currents shifted, and the seasonal winds changed their direction. These conditions eventually produced an almost constant precipitation of moisture from the movement of the heavily saturated atmosphere over the northern highlands. Snow began to fall on these elevated and therefore cool regions, and it continued to fall until it had attained a depth of 20,000 feet. The areas of the greatest depth of snow, together with altitude, determined the central points of subsequent glacial pressure flows. And the ice age persisted just as long as this excessive precipitation continued to cover these northern highlands with this enormous mantle of snow, which soon metamorphosed into solid but creeping ice.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.5.2",
          paperId: "61",
          paperSectionId: "61.5",
          paperSectionParagraphId: "61.5.2",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "2",
          partId: "3",
          sectionId: "5",
          sectionTitle: "The Early Ice Age",
          sortId: "3.061.005.002",
          standardReferenceId: "61:5.2",
          text: " Simultaneously with these land elevations the ocean currents shifted, and the seasonal winds changed their direction. These conditions eventually produced an almost constant precipitation of moisture from the movement of the heavily saturated atmosphere over the northern highlands. Snow began to fall on these elevated and therefore cool regions, and it continued to fall until it had attained a depth of 20,000 feet. The areas of the greatest depth of snow, together with altitude, determined the central points of subsequent glacial pressure flows. And the ice age persisted just as long as this excessive precipitation continued to cover these northern highlands with this enormous mantle of snow, which soon metamorphosed into solid but creeping ice.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.5.3",
          htmlText:
            '<span class="urantia-dev-pb-0">The great ice sheets of this period were all located on elevated highlands, not in mountainous regions where they are found today. One half of the glacial ice was in North America, one fourth in Eurasia, and one fourth elsewhere, chiefly in Antarctica. Africa was little affected by the ice, but Australia was almost covered with the antarctic ice blanket.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.5.3",
          paperId: "61",
          paperSectionId: "61.5",
          paperSectionParagraphId: "61.5.3",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "3",
          partId: "3",
          sectionId: "5",
          sectionTitle: "The Early Ice Age",
          sortId: "3.061.005.003",
          standardReferenceId: "61:5.3",
          text: " The great ice sheets of this period were all located on elevated highlands, not in mountainous regions where they are found today. One half of the glacial ice was in North America, one fourth in Eurasia, and one fourth elsewhere, chiefly in Antarctica. Africa was little affected by the ice, but Australia was almost covered with the antarctic ice blanket.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.5.4",
          htmlText:
            '<span class="urantia-dev-pb-2">The northern regions of this world have experienced six separate and distinct ice invasions, although there were scores of advances and recessions associated with the activity of each individual ice sheet. The ice in North America collected in two and, later, three centers. Greenland was covered, and Iceland was completely buried beneath the ice flow. In Europe the ice at various times covered the British Isles excepting the coast of southern England, and it overspread western Europe down to France.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.5.4",
          paperId: "61",
          paperSectionId: "61.5",
          paperSectionParagraphId: "61.5.4",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "4",
          partId: "3",
          sectionId: "5",
          sectionTitle: "The Early Ice Age",
          sortId: "3.061.005.004",
          standardReferenceId: "61:5.4",
          text: " The northern regions of this world have experienced six separate and distinct ice invasions, although there were scores of advances and recessions associated with the activity of each individual ice sheet. The ice in North America collected in two and, later, three centers. Greenland was covered, and Iceland was completely buried beneath the ice flow. In Europe the ice at various times covered the British Isles excepting the coast of southern England, and it overspread western Europe down to France.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.5.5",
          htmlText:
            '<span class="urantia-dev-pb-2"><em>2,000,000</em> years ago the first North American glacier started its southern advance. The ice age was now in the making, and this glacier consumed nearly one million years in its advance from, and retreat back toward, the northern pressure centers. The central ice sheet extended south as far as Kansas; the eastern and western ice centers were not then so extensive.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.5.5",
          paperId: "61",
          paperSectionId: "61.5",
          paperSectionParagraphId: "61.5.5",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "5",
          partId: "3",
          sectionId: "5",
          sectionTitle: "The Early Ice Age",
          sortId: "3.061.005.005",
          standardReferenceId: "61:5.5",
          text: " 2,000,000 years ago the first North American glacier started its southern advance. The ice age was now in the making, and this glacier consumed nearly one million years in its advance from, and retreat back toward, the northern pressure centers. The central ice sheet extended south as far as Kansas; the eastern and western ice centers were not then so extensive.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.5.6",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>1,500,000</em> years ago the first great glacier was retreating northward. In the meantime, enormous quantities of snow had been falling on Greenland and on the northeastern part of North America, and erelong this eastern ice mass began to flow southward. This was the second invasion of the ice.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.5.6",
          paperId: "61",
          paperSectionId: "61.5",
          paperSectionParagraphId: "61.5.6",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "6",
          partId: "3",
          sectionId: "5",
          sectionTitle: "The Early Ice Age",
          sortId: "3.061.005.006",
          standardReferenceId: "61:5.6",
          text: " 1,500,000 years ago the first great glacier was retreating northward. In the meantime, enormous quantities of snow had been falling on Greenland and on the northeastern part of North America, and erelong this eastern ice mass began to flow southward. This was the second invasion of the ice.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.5.7",
          htmlText:
            '<span class="urantia-dev-pb-0">These first two ice invasions were not extensive in Eurasia. During these early epochs of the ice age North America was overrun with mastodons, woolly mammoths, horses, camels, deer, musk oxen, bison, ground sloths, giant beavers, saber-toothed tigers, sloths as large as elephants, and many groups of the cat and dog families. But from this time forward they were rapidly reduced in numbers by the increasing cold of the glacial period. Toward the close of the ice age the majority of these animal species were extinct in North America.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.5.7",
          paperId: "61",
          paperSectionId: "61.5",
          paperSectionParagraphId: "61.5.7",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "7",
          partId: "3",
          sectionId: "5",
          sectionTitle: "The Early Ice Age",
          sortId: "3.061.005.007",
          standardReferenceId: "61:5.7",
          text: " These first two ice invasions were not extensive in Eurasia. During these early epochs of the ice age North America was overrun with mastodons, woolly mammoths, horses, camels, deer, musk oxen, bison, ground sloths, giant beavers, saber-toothed tigers, sloths as large as elephants, and many groups of the cat and dog families. But from this time forward they were rapidly reduced in numbers by the increasing cold of the glacial period. Toward the close of the ice age the majority of these animal species were extinct in North America.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.5.8",
          htmlText:
            '<span class="urantia-dev-pb-0">Away from the ice the land and water life of the world was little changed. Between the ice invasions the climate was about as mild as at present, perhaps a little warmer. The glaciers were, after all, local phenomena, though they spread out to cover enormous areas. The coastwise climate varied greatly between the times of glacial inaction and those times when enormous icebergs were sliding off the coast of Maine into the Atlantic, slipping out through Puget Sound into the Pacific, and thundering down Norwegian fiords into the North Sea.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.5.8",
          paperId: "61",
          paperSectionId: "61.5",
          paperSectionParagraphId: "61.5.8",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "8",
          partId: "3",
          sectionId: "5",
          sectionTitle: "The Early Ice Age",
          sortId: "3.061.005.008",
          standardReferenceId: "61:5.8",
          text: " Away from the ice the land and water life of the world was little changed. Between the ice invasions the climate was about as mild as at present, perhaps a little warmer. The glaciers were, after all, local phenomena, though they spread out to cover enormous areas. The coastwise climate varied greatly between the times of glacial inaction and those times when enormous icebergs were sliding off the coast of Maine into the Atlantic, slipping out through Puget Sound into the Pacific, and thundering down Norwegian fiords into the North Sea.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.6.-",
          htmlText: null,
          labels: [],
          language: "eng",
          objectID: "3:61.6.-",
          paperId: "61",
          paperSectionId: "61.6",
          paperSectionParagraphId: null,
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: null,
          partId: "3",
          sectionId: "6",
          sectionTitle: "Primitive Man in the Ice Age",
          sortId: "3.061.006.000",
          standardReferenceId: "61:6.0",
          text: null,
          type: "section",
          typeRank: 2,
        },
        {
          globalId: "3:61.6.1",
          htmlText:
            '<span class="urantia-dev-pb-4">The great event of this glacial period was the evolution of primitive man. Slightly to the west of India, on land now under water and among the offspring of Asiatic migrants of the older North American lemur types, the dawn mammals <em>suddenly</em> appeared. These small animals walked mostly on their hind legs, and they possessed large brains in proportion to their size and in comparison with the brains of other animals. In the seventieth generation of this order of life a new and higher group of animals <em>suddenly</em> differentiated. These new mid-mammals—almost twice the size and height of their ancestors and possessing proportionately increased brain power—had only well established themselves when the Primates, the third vital mutation, <em>suddenly</em> appeared. (At this same time, a retrograde development within the mid-mammal stock gave origin to the simian ancestry; and from that day to this the human branch has gone forward by progressive evolution, while the simian tribes have remained stationary or have actually retrogressed.)</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.6.1",
          paperId: "61",
          paperSectionId: "61.6",
          paperSectionParagraphId: "61.6.1",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "1",
          partId: "3",
          sectionId: "6",
          sectionTitle: "Primitive Man in the Ice Age",
          sortId: "3.061.006.001",
          standardReferenceId: "61:6.1",
          text: " The great event of this glacial period was the evolution of primitive man. Slightly to the west of India, on land now under water and among the offspring of Asiatic migrants of the older North American lemur types, the dawn mammals suddenly appeared. These small animals walked mostly on their hind legs, and they possessed large brains in proportion to their size and in comparison with the brains of other animals. In the seventieth generation of this order of life a new and higher group of animals suddenly differentiated. These new mid-mammals—almost twice the size and height of their ancestors and possessing proportionately increased brain power—had only well established themselves when the Primates, the third vital mutation, suddenly appeared. (At this same time, a retrograde development within the mid-mammal stock gave origin to the simian ancestry; and from that day to this the human branch has gone forward by progressive evolution, while the simian tribes have remained stationary or have actually retrogressed.)",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.6.2",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>1,000,000</em> years ago Urantia was registered as an <em>inhabited world.</em> A mutation within the stock of the progressing Primates <em>suddenly</em> produced two primitive human beings, the actual ancestors of mankind.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.6.2",
          paperId: "61",
          paperSectionId: "61.6",
          paperSectionParagraphId: "61.6.2",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "2",
          partId: "3",
          sectionId: "6",
          sectionTitle: "Primitive Man in the Ice Age",
          sortId: "3.061.006.002",
          standardReferenceId: "61:6.2",
          text: " 1,000,000 years ago Urantia was registered as an inhabited world. A mutation within the stock of the progressing Primates suddenly produced two primitive human beings, the actual ancestors of mankind.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.6.3",
          htmlText:
            '<span class="urantia-dev-pb-4">This event occurred at about the time of the beginning of the third glacial advance; thus it may be seen that your early ancestors were born and bred in a stimulating, invigorating, and difficult environment. And the sole survivors of these Urantia aborigines, the Eskimos, even now prefer to dwell in frigid northern climes.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.6.3",
          paperId: "61",
          paperSectionId: "61.6",
          paperSectionParagraphId: "61.6.3",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "3",
          partId: "3",
          sectionId: "6",
          sectionTitle: "Primitive Man in the Ice Age",
          sortId: "3.061.006.003",
          standardReferenceId: "61:6.3",
          text: " This event occurred at about the time of the beginning of the third glacial advance; thus it may be seen that your early ancestors were born and bred in a stimulating, invigorating, and difficult environment. And the sole survivors of these Urantia aborigines, the Eskimos, even now prefer to dwell in frigid northern climes.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.6.4",
          htmlText:
            '<span class="urantia-dev-pb-0">Human beings were not present in the Western Hemisphere until near the close of the ice age. But during the interglacial epochs they passed westward around the Mediterranean and soon overran the continent of Europe. In the caves of western Europe may be found human bones mingled with the remains of both tropic and arctic animals, testifying that man lived in these regions throughout the later epochs of the advancing and retreating glaciers.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.6.4",
          paperId: "61",
          paperSectionId: "61.6",
          paperSectionParagraphId: "61.6.4",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "4",
          partId: "3",
          sectionId: "6",
          sectionTitle: "Primitive Man in the Ice Age",
          sortId: "3.061.006.004",
          standardReferenceId: "61:6.4",
          text: " Human beings were not present in the Western Hemisphere until near the close of the ice age. But during the interglacial epochs they passed westward around the Mediterranean and soon overran the continent of Europe. In the caves of western Europe may be found human bones mingled with the remains of both tropic and arctic animals, testifying that man lived in these regions throughout the later epochs of the advancing and retreating glaciers.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.-",
          htmlText: null,
          labels: [],
          language: "eng",
          objectID: "3:61.7.-",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: null,
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: null,
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.000",
          standardReferenceId: "61:7.0",
          text: null,
          type: "section",
          typeRank: 2,
        },
        {
          globalId: "3:61.7.1",
          htmlText:
            '<span class="urantia-dev-pb-4">Throughout the glacial period other activities were in progress, but the action of the ice overshadows all other phenomena in the northern latitudes. No other terrestrial activity leaves such characteristic evidence on the topography. The distinctive boulders and surface cleavages, such as potholes, lakes, displaced stone, and rock flour, are to be found in connection with no other phenomenon in nature. The ice is also responsible for those gentle swells, or surface undulations, known as drumlins. And a glacier, as it advances, displaces rivers and changes the whole face of the earth. Glaciers alone leave behind them those telltale drifts—the ground, lateral, and terminal moraines. These drifts, particularly the ground moraines, extend from the eastern seaboard north and westward in North America and are found in Europe and Siberia.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.1",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.1",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "1",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.001",
          standardReferenceId: "61:7.1",
          text: " Throughout the glacial period other activities were in progress, but the action of the ice overshadows all other phenomena in the northern latitudes. No other terrestrial activity leaves such characteristic evidence on the topography. The distinctive boulders and surface cleavages, such as potholes, lakes, displaced stone, and rock flour, are to be found in connection with no other phenomenon in nature. The ice is also responsible for those gentle swells, or surface undulations, known as drumlins. And a glacier, as it advances, displaces rivers and changes the whole face of the earth. Glaciers alone leave behind them those telltale drifts—the ground, lateral, and terminal moraines. These drifts, particularly the ground moraines, extend from the eastern seaboard north and westward in North America and are found in Europe and Siberia.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.2",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>750,000</em> years ago the fourth ice sheet, a union of the North American central and eastern ice fields, was well on its way south; at its height it reached to southern Illinois, displacing the Mississippi River fifty miles to the west, and in the east it extended as far south as the Ohio River and central Pennsylvania.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.2",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.2",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "2",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.002",
          standardReferenceId: "61:7.2",
          text: " 750,000 years ago the fourth ice sheet, a union of the North American central and eastern ice fields, was well on its way south; at its height it reached to southern Illinois, displacing the Mississippi River fifty miles to the west, and in the east it extended as far south as the Ohio River and central Pennsylvania.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.3",
          htmlText:
            '<span class="urantia-dev-pb-4">In Asia the Siberian ice sheet made its southernmost invasion, while in Europe the advancing ice stopped just short of the mountain barrier of the Alps.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.3",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.3",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "3",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.003",
          standardReferenceId: "61:7.3",
          text: " In Asia the Siberian ice sheet made its southernmost invasion, while in Europe the advancing ice stopped just short of the mountain barrier of the Alps.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.4",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>500,000</em> years ago, during the fifth advance of the ice, a new development accelerated the course of human evolution. <em>Suddenly</em> and in one generation the six colored races mutated from the aboriginal human stock. This is a doubly important date since it also marks the arrival of the Planetary Prince.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.4",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.4",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "4",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.004",
          standardReferenceId: "61:7.4",
          text: " 500,000 years ago, during the fifth advance of the ice, a new development accelerated the course of human evolution. Suddenly and in one generation the six colored races mutated from the aboriginal human stock. This is a doubly important date since it also marks the arrival of the Planetary Prince.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.5",
          htmlText:
            '<span class="urantia-dev-pb-4">In North America the advancing fifth glacier consisted of a combined invasion by all three ice centers. The eastern lobe, however, extended only a short distance below the St. Lawrence valley, and the western ice sheet made little southern advance. But the central lobe reached south to cover most of the state of Iowa. In Europe this invasion of the ice was not so extensive as the preceding one.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.5",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.5",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "5",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.005",
          standardReferenceId: "61:7.5",
          text: " In North America the advancing fifth glacier consisted of a combined invasion by all three ice centers. The eastern lobe, however, extended only a short distance below the St. Lawrence valley, and the western ice sheet made little southern advance. But the central lobe reached south to cover most of the state of Iowa. In Europe this invasion of the ice was not so extensive as the preceding one.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.6",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>250,000</em> years ago the sixth and last glaciation began. And despite the fact that the northern highlands had begun to sink slightly, this was the period of greatest snow deposition on the northern ice fields.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.6",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.6",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "6",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.006",
          standardReferenceId: "61:7.6",
          text: " 250,000 years ago the sixth and last glaciation began. And despite the fact that the northern highlands had begun to sink slightly, this was the period of greatest snow deposition on the northern ice fields.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.7",
          htmlText:
            '<span class="urantia-dev-pb-4">In this invasion the three great ice sheets coalesced into one vast ice mass, and all of the western mountains participated in this glacial activity. This was the largest of all ice invasions in North America; the ice moved south over fifteen hundred miles from its pressure centers, and North America experienced its lowest temperatures.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.7",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.7",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "7",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.007",
          standardReferenceId: "61:7.7",
          text: " In this invasion the three great ice sheets coalesced into one vast ice mass, and all of the western mountains participated in this glacial activity. This was the largest of all ice invasions in North America; the ice moved south over fifteen hundred miles from its pressure centers, and North America experienced its lowest temperatures.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.8",
          htmlText:
            '<span class="urantia-dev-pb-4"><em>200,000</em> years ago, during the advance of the last glacier, there occurred an episode which had much to do with the march of events on Urantia—the Lucifer rebellion.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.8",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.8",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "8",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.008",
          standardReferenceId: "61:7.8",
          text: " 200,000 years ago, during the advance of the last glacier, there occurred an episode which had much to do with the march of events on Urantia—the Lucifer rebellion.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.9",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>150,000</em> years ago the sixth and last glacier reached its farthest points of southern extension, the western ice sheet crossing just over the Canadian border; the central coming down into Kansas, Missouri, and Illinois; the eastern sheet advancing south and covering the greater portion of Pennsylvania and Ohio.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.9",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.9",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "9",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.009",
          standardReferenceId: "61:7.9",
          text: " 150,000 years ago the sixth and last glacier reached its farthest points of southern extension, the western ice sheet crossing just over the Canadian border; the central coming down into Kansas, Missouri, and Illinois; the eastern sheet advancing south and covering the greater portion of Pennsylvania and Ohio.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.10",
          htmlText:
            '<span class="urantia-dev-pb-4">This is the glacier that sent forth the many tongues, or ice lobes, which carved out the present-day lakes, great and small. During its retreat the North American system of Great Lakes was produced. And Urantian geologists have very accurately deduced the various stages of this development and have correctly surmised that these bodies of water did, at different times, empty first into the Mississippi valley, then eastward into the Hudson valley, and finally by a northern route into the St. Lawrence. It is thirty-seven thousand years since the connected Great Lakes system began to empty out over the present Niagara route.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.10",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.10",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "10",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.010",
          standardReferenceId: "61:7.10",
          text: " This is the glacier that sent forth the many tongues, or ice lobes, which carved out the present-day lakes, great and small. During its retreat the North American system of Great Lakes was produced. And Urantian geologists have very accurately deduced the various stages of this development and have correctly surmised that these bodies of water did, at different times, empty first into the Mississippi valley, then eastward into the Hudson valley, and finally by a northern route into the St. Lawrence. It is thirty-seven thousand years since the connected Great Lakes system began to empty out over the present Niagara route.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.11",
          htmlText:
            '<span class="urantia-dev-pb-0"><em>100,000</em> years ago, during the retreat of the last glacier, the vast polar ice sheets began to form, and the center of ice accumulation moved considerably northward. And as long as the polar regions continue to be covered with ice, it is hardly possible for another glacial age to occur, regardless of future land elevations or modification of ocean currents.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.11",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.11",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "11",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.011",
          standardReferenceId: "61:7.11",
          text: " 100,000 years ago, during the retreat of the last glacier, the vast polar ice sheets began to form, and the center of ice accumulation moved considerably northward. And as long as the polar regions continue to be covered with ice, it is hardly possible for another glacial age to occur, regardless of future land elevations or modification of ocean currents.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.12",
          htmlText:
            '<span class="urantia-dev-pb-0">This last glacier was one hundred thousand years advancing, and it required a like span of time to complete its northern retreat. The temperate regions have been free from the ice for a little over fifty thousand years.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.12",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.12",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "12",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.012",
          standardReferenceId: "61:7.12",
          text: " This last glacier was one hundred thousand years advancing, and it required a like span of time to complete its northern retreat. The temperate regions have been free from the ice for a little over fifty thousand years.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.13",
          htmlText:
            '<span class="urantia-dev-pb-0">The rigorous glacial period destroyed many species and radically changed numerous others. Many were sorely sifted by the to-and-fro migration which was made necessary by the advancing and retreating ice. Those animals which followed the glaciers back and forth over the land were the bear, bison, reindeer, musk ox, mammoth, and mastodon.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.13",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.13",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "13",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.013",
          standardReferenceId: "61:7.13",
          text: " The rigorous glacial period destroyed many species and radically changed numerous others. Many were sorely sifted by the to-and-fro migration which was made necessary by the advancing and retreating ice. Those animals which followed the glaciers back and forth over the land were the bear, bison, reindeer, musk ox, mammoth, and mastodon.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.14",
          htmlText:
            '<span class="urantia-dev-pb-0">The mammoth sought the open prairies, but the mastodon preferred the sheltered fringes of the forest regions. The mammoth, until a late date, ranged from Mexico to Canada; the Siberian variety became wool covered. The mastodon persisted in North America until exterminated by the red man much as the white man later killed off the bison.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.14",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.14",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "14",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.014",
          standardReferenceId: "61:7.14",
          text: " The mammoth sought the open prairies, but the mastodon preferred the sheltered fringes of the forest regions. The mammoth, until a late date, ranged from Mexico to Canada; the Siberian variety became wool covered. The mastodon persisted in North America until exterminated by the red man much as the white man later killed off the bison.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.15",
          htmlText:
            '<span class="urantia-dev-pb-0">In North America, during the last glaciation, the horse, tapir, llama, and saber-toothed tiger became extinct. In their places sloths, armadillos, and water hogs came up from South America.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.15",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.15",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "15",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.015",
          standardReferenceId: "61:7.15",
          text: " In North America, during the last glaciation, the horse, tapir, llama, and saber-toothed tiger became extinct. In their places sloths, armadillos, and water hogs came up from South America.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.16",
          htmlText:
            '<span class="urantia-dev-pb-4">The enforced migration of life before the advancing ice led to an extraordinary commingling of plants and of animals, and with the retreat of the final ice invasion, many arctic species of both plants and animals were left stranded high upon certain mountain peaks, whither they had journeyed to escape destruction by the glacier. And so, today, these dislocated plants and animals may be found high up on the Alps of Europe and even on the Appalachian Mountains of North America.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.16",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.16",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "16",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.016",
          standardReferenceId: "61:7.16",
          text: " The enforced migration of life before the advancing ice led to an extraordinary commingling of plants and of animals, and with the retreat of the final ice invasion, many arctic species of both plants and animals were left stranded high upon certain mountain peaks, whither they had journeyed to escape destruction by the glacier. And so, today, these dislocated plants and animals may be found high up on the Alps of Europe and even on the Appalachian Mountains of North America.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.17",
          htmlText:
            '<span class="urantia-dev-pb-4">The ice age is the last completed geologic period, the so-called <em>Pleistocene,</em> over two million years in length.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.17",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.17",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "17",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.017",
          standardReferenceId: "61:7.17",
          text: " The ice age is the last completed geologic period, the so-called Pleistocene, over two million years in length.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.18",
          htmlText:
            '<span class="urantia-dev-pb-2"><em>35,000</em> years ago marks the termination of the great ice age excepting in the polar regions of the planet. This date is also significant in that it approximates the arrival of a Material Son and Daughter and the beginning of the Adamic dispensation, roughly corresponding to the beginning of the <em>Holocene</em> or postglacial period.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.18",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.18",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "18",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.018",
          standardReferenceId: "61:7.18",
          text: " 35,000 years ago marks the termination of the great ice age excepting in the polar regions of the planet. This date is also significant in that it approximates the arrival of a Material Son and Daughter and the beginning of the Adamic dispensation, roughly corresponding to the beginning of the Holocene or postglacial period.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.19",
          htmlText:
            '<span class="urantia-dev-pb-4">This narrative, extending from the rise of mammalian life to the retreat of the ice and on down to historic times, covers a span of almost fifty million years. This is the last—the current—geologic period and is known to your researchers as the <em>Cenozoic</em> or recent-times era.</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.19",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.19",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "19",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.019",
          standardReferenceId: "61:7.19",
          text: " This narrative, extending from the rise of mammalian life to the retreat of the ice and on down to historic times, covers a span of almost fifty million years. This is the last—the current—geologic period and is known to your researchers as the Cenozoic or recent-times era.",
          type: "paragraph",
          typeRank: 3,
        },
        {
          globalId: "3:61.7.20",
          htmlText:
            '<span class="urantia-dev-pb-4">[Sponsored by a Resident Life Carrier.]</span>',
          labels: [],
          language: "eng",
          objectID: "3:61.7.20",
          paperId: "61",
          paperSectionId: "61.7",
          paperSectionParagraphId: "61.7.20",
          paperTitle: "The Mammalian Era on Urantia",
          paragraphId: "20",
          partId: "3",
          sectionId: "7",
          sectionTitle: "The Continuing Ice Age",
          sortId: "3.061.007.020",
          standardReferenceId: "61:7.20",
          text: " [Sponsored by a Resident Life Carrier.]",
          type: "paragraph",
          typeRank: 3,
        },
      ],
    },
  };

  // Add mp3 file URLs for each node if there is one.
  // paperData?.data?.results?.forEach((node: UBNode) => {
  //   node.mp3Url = `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/data/mp3/eng/tts-1-hd-echo-${node.globalId}.mp3`;
  // });

  return {
    props: {
      paperData,
    },
  };
}

export async function getStaticPaths() {
  const paperIds = Array.from(Array(197).keys());
  const paths = paperIds.map((paperId) => ({
    params: { paperId: String(paperId) },
  }));

  return {
    paths,
    fallback: "blocking",
  };
}

export default PaperPage;
