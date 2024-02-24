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
    signIn("google", { callbackUrl });
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
      </main>

      <Footer marginBottom="8.5rem" />
    </div>
  );
};

export async function getStaticProps(context: any) {
  const { paperId } = context.params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/api/v1/urantia-book/read?paperId=${paperId}`
  );
  const paperData = await res.json();

  // Add mp3 file URLs for each node if there is one.
  paperData?.data?.results?.forEach((node: UBNode) => {
    node.mp3Url = `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/data/mp3/eng/tts-1-hd-echo-${node.globalId}.mp3`;
  });

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
