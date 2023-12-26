// UBNode modules.
import Link from "next/link";
import moment from "moment";
import { NodeComment, SavedNode } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
// Relative modules.
import Comment from "@/components/Comment";
import Explain from "@/components/Explain";
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import RelatedWorks from "@/components/RelatedWorks";
import Share from "@/components/Share";
import Spinner from "@/components/Spinner";

type PaperPageProps = {
  paperData: {
    data: {
      results: UBNode[];
    };
  };
};

const PaperPage = ({ paperData }: PaperPageProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  // Toggled states.
  const [expandedGlobalId, setExpandedGlobalId] = useState<string>("");

  // Saved nodes.
  const [savedNodes, setSavedNodes] = useState<SavedNode[]>([]);

  // Node comments.
  const [nodeComments, setNodeComments] = useState<NodeComment[]>([]);

  // Network states.
  const [savingGlobalIds, setSavingGlobalIds] = useState<string[]>([]);
  const [savingErrorGlobalIds, setSavingErrorGlobalIds] = useState<string[]>(
    []
  );

  // Modal states.
  const [selectedGlobalIdComment, setSelectedGlobalIdComment] =
    useState<string>("");
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
  const readNodesRef = useRef<Set<string>>(new Set());

  const estimatedReadTime = (node: UBNode) => {
    const paragraph = document.getElementById(node.globalId);
    if (!paragraph) {
      console.warn(
        `Could not find paragraph with node.globalId ${node.globalId}, estimated read time will be 0 and paragraph will be immediately marked as read.`
      );
      return 0;
    }
    const words = paragraph.innerText.split(" ").length;
    const averageReadingSpeed = 400; // Words per minute
    return (words / averageReadingSpeed) * 60; // Time in seconds
  };

  const markParagraphAsRead = async (node: UBNode) => {
    // Check if the node has already been marked as read
    if (readNodesRef.current.has(node.globalId)) {
      console.log(`Node ${node.globalId} has already been marked as read.`);
      return;
    }

    // Skip if you are not logged in
    if (!session) {
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
      readNodesRef.current.add(node.globalId);
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

  const handleParagraphInView = (node: UBNode) => {
    // Check if the node has already been marked as read
    if (readNodesRef.current.has(node.globalId)) {
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

  // Fetch saved globalIds on mount
  useEffect(() => {
    const fetchSavedGlobalIds = async () => {
      try {
        const response = await fetch(
          `/api/user/nodes/saved?paperId=${paperData.data.results[0].paperId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const savedNodes = await response.json();
        setSavedNodes(savedNodes);
      } catch (error) {
        console.error("Error fetching saved globalIds:", error);
      }
    };

    fetchSavedGlobalIds();
  }, [paperData.data.results]);

  // Fetch node comments on mount
  useEffect(() => {
    const fetchNodeComments = async () => {
      try {
        const response = await fetch(
          `/api/user/nodes/comments?paperId=${paperData.data.results[0].paperId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const nodeComments = await response.json();
        setNodeComments(nodeComments);
      } catch (error) {
        console.error("Error fetching node comments:", error);
      }
    };

    fetchNodeComments();
  }, [paperData.data.results]);

  // Start reading timer checks.
  useEffect(() => {
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
  }, []);

  // Start observing paragraphs and when they come into view, start the reading timer.
  useEffect(() => {
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
            handleParagraphInView(node);
          } else {
            // Paragraph leaves view
            resetReadingTime(globalId);
          }
        });
      },
      { threshold: 0.5 } // Threshold means that 50% of the paragraph must be in the viewport
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
        // Scroll to the element
        const yOffset = -60; // Adjust based on your header height or other factors
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
                highlightSpan.className = "text-yellow-200 underline";
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
  }, [router.asPath]);

  // Show a spinner until the content has loaded.
  if (!paperData) {
    return <Spinner />;
  }

  // Helpers.
  const onExplainClose = () => {
    setSelectedGlobalIdExplain("");
  };

  const onExplainClick = (globalId: string) => () => {
    setSelectedGlobalIdExplain(globalId);
  };

  const onCommentClose = () => {
    setSelectedGlobalIdComment("");
  };

  const onCommentClick = (globalId: string) => () => {
    setSelectedGlobalIdComment(globalId);
  };

  const onRelatedWorksClose = () => {
    setSelectedGlobalIdRelatedWorks("");
  };

  const onRelatedWorksClick = (globalId: string) => () => {
    setSelectedGlobalIdRelatedWorks(globalId);
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

  const deriveSaveText = (globalId: string) => {
    if (savingGlobalIds.includes(globalId)) {
      return "Saving";
    }

    if (savingErrorGlobalIds.includes(globalId)) {
      return "Saving Error";
    }

    if (savedNodes.some((node) => node.globalId === globalId)) {
      return "Saved";
    }

    return "Save";
  };

  const saveGlobalId = async (
    globalId: string,
    paperId: string,
    paperSectionId?: string,
    paperSectionParagraphId?: string
  ): Promise<SavedNode | undefined> => {
    // Escape early if we are already saving.
    if (savingGlobalIds.includes(globalId)) {
      return;
    }

    // Escape early if we aren't logged in.
    if (!session) {
      console.warn("User is not logged in, cannot save global ID.");
      return;
    }

    // Set saving state + reset error for globalId.
    setSavingGlobalIds([...savingGlobalIds, globalId]);
    const updatedSavingErrorGlobalIds = savingErrorGlobalIds.filter(
      (id) => id !== globalId
    );
    setSavingErrorGlobalIds(updatedSavingErrorGlobalIds);

    try {
      // Make request to save node for user.
      const response = await fetch(`/api/user/nodes/saved`, {
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
          `Unexpected response status ${response.status} when attempting to save global ID ${globalId} for user.`
        );
      }
      const savedNode = await response.json();
      return savedNode;
    } catch (error: any) {
      // Set error state for globalId.
      console.error("Error attempting to save global ID for user:", error);
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

  const onSaveClick = (node: UBNode) => async () => {
    // Escape early if it's already saved.
    if (savedNodes.some((savedNode) => savedNode.globalId === node.globalId)) {
      return;
    }

    // Make request to save globalId for user.
    const savedNode = await saveGlobalId(
      node.globalId,
      node.paperId,
      node.paperSectionId,
      node.paperSectionParagraphId
    );

    // Add the id.
    if (savedNode) {
      setSavedNodes([...savedNodes, savedNode]);
    }
  };

  const renderNode = (node: UBNode) => {
    switch (node.type) {
      case "paper": {
        return (
          <div key={node.globalId} className="mb-12 text-center">
            {parseInt(node.paperId) > 0 && (
              <p className="mb-2">Paper {node.paperId}</p>
            )}
            <h1 className="text-4xl font-bold mb-12" id={node.globalId}>
              {node.paperTitle}
            </h1>
          </div>
        );
      }
      case "section": {
        if (!node.sectionTitle) return null;
        return (
          <div key={node.globalId} className="mt-20 mb-12 text-center">
            <h2 className="text-3xl font-bold" id={node.globalId}>
              {node.sectionTitle}
            </h2>
          </div>
        );
      }
      case "paragraph": {
        const savedNode = savedNodes.find(
          (savedNode) => savedNode.globalId === node.globalId
        );
        // Find all node comments.
        const nodeCommentsForNode = nodeComments.filter(
          (nodeComment) => nodeComment.globalId === node.globalId
        );

        return (
          <div
            className="paragraph mb-6 text-left"
            id={node.globalId}
            key={node.globalId}
          >
            <div className="text-lg leading-relaxed">
              <div className="flex items-center justify-between block mb-2 text-gray-400 text-sm">
                <div className="flex items-center">
                  {node.globalId?.split(":")[1]}
                  {savedNode && (
                    <Link
                      className="ml-2 text-xs bg-green-600 text-white font-bold py-1 px-2 rounded-full hover:no-underline"
                      href="/activity"
                    >
                      Saved Quote
                    </Link>
                  )}
                  {nodeCommentsForNode.length > 0 ? (
                    <Link
                      className="ml-2 text-xs bg-blue-600 text-white font-bold py-1 px-2 rounded-full hover:no-underline"
                      href="/activity"
                    >
                      {nodeCommentsForNode.length} Comment
                      {nodeCommentsForNode.length > 1 ? "s" : ""}
                    </Link>
                  ) : null}
                </div>
                <div className="flex items-center">
                  {expandedGlobalId === node.globalId && (
                    <div className="flex items-center mr-2 fade-in">
                      {/* <button
                        className="bg-transparent border-none p-0 m-0 mr-2 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                        onClick={onExplainClick(node.globalId)}
                        type="button"
                      >
                        Explain
                      </button> */}
                      {session && (
                        <>
                          <button
                            className="bg-transparent border-none p-0 m-0 mr-2 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                            onClick={onCommentClick(node.globalId)}
                            type="button"
                          >
                            Comment
                          </button>
                          <span className="mr-2">|</span>
                        </>
                      )}
                      {/* <button
                        className="bg-transparent border-none p-0 m-0 focus:outline-none mr-2 text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                        onClick={onRelatedWorksClick(node.globalId)}
                        type="button"
                      >
                        Related
                      </button>
                      <span className="mr-2">|</span> */}
                      <button
                        className="bg-transparent border-none p-0 m-0 focus:outline-none mr-2 text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                        onClick={onShareClick(node.globalId)}
                        type="button"
                      >
                        Share
                      </button>
                      {session && (
                        <>
                          <span className="mr-2">|</span>
                          <button
                            className="bg-transparent border-none p-0 m-0 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                            onClick={onSaveClick(node)}
                            type="button"
                          >
                            {deriveSaveText(node.globalId)}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  <button
                    className="bg-transparent border-none p-0 m-0 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                    onClick={onNodeSettingsClick(node.globalId)}
                    type="button"
                  >
                    ⋯
                  </button>
                </div>
              </div>
              <div
                dangerouslySetInnerHTML={{ __html: node.htmlText as string }}
                onClick={onNodeSettingsClick(node.globalId, {
                  onlyOpen: true,
                })}
                onMouseDown={onNodeSettingsClick(node.globalId, {
                  onlyOpen: true,
                })}
              />
            </div>
          </div>
        );
      }
      default: {
        return null;
      }
    }
  };

  // Get the nodes from the paper data.
  const nodes = paperData.data.results;

  // Parse the current paperId as a number
  const currentPaperId = parseInt(nodes[0].paperId);

  // Calculate the next and previous paper IDs
  const prevPaperId = currentPaperId > 0 ? currentPaperId - 1 : -1;
  const nextPaperId = currentPaperId < 196 ? currentPaperId + 1 : null;

  // Calculate nodes for modals.
  const explainNode = selectedGlobalIdExplain
    ? paperData.data.results.find(
        (node) => node.globalId === selectedGlobalIdExplain
      )
    : undefined;
  const commentNode = selectedGlobalIdComment
    ? paperData.data.results.find(
        (node) => node.globalId === selectedGlobalIdComment
      )
    : undefined;
  const relatedWorksNode = selectedGlobalIdRelatedWorks
    ? paperData.data.results.find(
        (node) => node.globalId === selectedGlobalIdRelatedWorks
      )
    : undefined;
  const shareNode = selectedGlobalIdShare
    ? paperData.data.results.find(
        (node) => node.globalId === selectedGlobalIdShare
      )
    : undefined;

  // Page content
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <HeadTag
        metaDescription={nodes[0].paperTitle}
        titlePrefix={
          parseInt(nodes[0].paperId) > 0
            ? `Paper ${nodes[0].paperId} - ${nodes[0].paperTitle}`
            : "Foreword"
        }
      />

      <Navbar />

      {/* Explain Modal */}
      {selectedGlobalIdExplain && (
        <Explain onClose={onExplainClose} node={explainNode} />
      )}

      {/* Comment Modal */}
      {selectedGlobalIdComment && (
        <Comment onClose={onCommentClose} node={commentNode} />
      )}

      {/* Related Works Modal */}
      {selectedGlobalIdRelatedWorks && (
        <RelatedWorks onClose={onRelatedWorksClose} node={relatedWorksNode} />
      )}

      {/* Share Modal */}
      {selectedGlobalIdShare && (
        <Share onClose={onShareClose} node={shareNode} />
      )}

      <main className="mt-28 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        {/* Navigation links for previous and next papers */}
        <div className="flex justify-between mt-2 mb-4">
          {prevPaperId >= 0 ? (
            <Link
              className="flex-1 text-gray-400 hover:text-white transition duration-300 ease-in-out"
              href={`/papers/${prevPaperId}`}
            >
              ← {prevPaperId === 0 ? "Foreword" : `Paper ${prevPaperId}`}
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          <Link
            className="flex-1 text-center text-gray-400 hover:text-white transition duration-300 ease-in-out"
            href="/read"
          >
            Table of Contents
          </Link>
          {nextPaperId ? (
            <Link
              className="flex-1 text-right text-gray-400 hover:text-white transition duration-300 ease-in-out"
              href={`/papers/${nextPaperId}`}
            >
              Paper {nextPaperId} →
            </Link>
          ) : (
            <span className="flex-1 text-right" />
          )}
        </div>

        {/* Paper content */}
        <div className="mb-12">
          {nodes.map((node: UBNode) => renderNode(node))}
        </div>

        {/* Navigation links for previous and next papers */}
        <div className="flex justify-between mb-12">
          {prevPaperId >= 0 ? (
            <Link
              className="flex-1 text-gray-400 hover:text-white transition duration-300 ease-in-out"
              href={`/papers/${prevPaperId}`}
            >
              ← Paper {prevPaperId}
            </Link>
          ) : (
            <span />
          )}
          {nextPaperId ? (
            <Link
              className="flex-1 text-right text-gray-400 hover:text-white transition duration-300 ease-in-out"
              href={`/papers/${nextPaperId}`}
            >
              Paper {nextPaperId} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const { paperId } = context.params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/api/v1/urantia-book/read?paperId=${paperId}`
  );
  const paperData = await res.json();

  return {
    props: {
      paperData,
    },
  };
}

export default PaperPage;
