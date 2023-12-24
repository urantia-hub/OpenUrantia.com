// UBNode modules.
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    // Extracting the hash and query parameter from the URL.
    const [hash, queryParam] = router.asPath.split("#")[1]?.split("?") || [];
    const queryParams = new URLSearchParams(queryParam);
    const query = queryParams.get("q");

    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        // Scroll to the element
        const yOffset = -60; // Adjust based on your header height or other factors
        const y =
          element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y });

        if (query) {
          // Highlight the query text
          const regex = new RegExp(query, "gi");
          const replacedHtml = element.innerHTML.replace(
            regex,
            (match) => `<span class="text-yellow-200 underline">${match}</span>`
          );
          element.innerHTML = replacedHtml;
        }
      }
    }
  }, [router.asPath]);

  // Toggled states.
  const [expandedGlobalIds, setExpandedGlobalIds] = useState<string[]>([]);
  const [savedGlobalIds, setSavedGlobalIds] = useState<string[]>([]);

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

  // Show a spinner until the content has loaded.
  if (!paperData) {
    return <Spinner />;
  }

  // Helpers for Explain.
  const onExplainClose = () => {
    setSelectedGlobalIdExplain("");
  };

  const onExplainClick = (globalId: string) => () => {
    setSelectedGlobalIdExplain(globalId);
  };

  // Helpers for Comment.
  const onCommentClose = () => {
    setSelectedGlobalIdComment("");
  };

  const onCommentClick = (globalId: string) => () => {
    setSelectedGlobalIdComment(globalId);
  };

  // Helpers for Related.
  const onRelatedWorksClose = () => {
    setSelectedGlobalIdRelatedWorks("");
  };

  const onRelatedWorksClick = (globalId: string) => () => {
    setSelectedGlobalIdRelatedWorks(globalId);
  };

  // Helpers for Share.
  const onShareClose = () => {
    setSelectedGlobalIdShare("");
  };

  const onShareClick = (globalId: string) => () => {
    setSelectedGlobalIdShare(globalId);
  };

  // Helpers for node ellipsis ⋯
  const onNodeSettingsClose = (globalId: string) => {
    // Remove globalId from expanded list.
    const updatedNodeSettingsIds = expandedGlobalIds.filter(
      (id) => id !== globalId
    );
    setExpandedGlobalIds(updatedNodeSettingsIds);
  };

  const onNodeSettingsClick = (globalId: string) => () => {
    // Remove the id if it's already expanded.
    if (expandedGlobalIds.includes(globalId)) {
      onNodeSettingsClose(globalId);
      return;
    }

    // Add the id.
    setExpandedGlobalIds([...expandedGlobalIds, globalId]);
  };

  const deriveSaveText = (globalId: string) => {
    if (savingGlobalIds.includes(globalId)) {
      return "Saving";
    }

    if (savingErrorGlobalIds.includes(globalId)) {
      return "Saving Error";
    }

    if (savedGlobalIds.includes(globalId)) {
      return "Saved";
    }

    return "Save";
  };

  const saveGlobalId = async (
    globalId: string,
    paperId: string,
    paperSectionId?: string,
    paperSectionParagraphId?: string
  ): Promise<boolean | undefined> => {
    // Escape early if we are already saving.
    if (savingGlobalIds.includes(globalId)) {
      return;
    }

    // Set saving state + reset error for globalId.
    setSavingGlobalIds([...savingGlobalIds, globalId]);
    const updatedSavingErrorGlobalIds = savingErrorGlobalIds.filter(
      (id) => id !== globalId
    );
    setSavingErrorGlobalIds(updatedSavingErrorGlobalIds);

    try {
      // Make request to save globalId for user.
      const response = await fetch(`/api/user/nodes`, {
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
      return true;
    } catch (error: any) {
      // Set error state for globalId.
      console.error("Error attempting to save global ID for user:", error);
      setSavingErrorGlobalIds([...savingErrorGlobalIds, globalId]);
      return false;
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
    if (savedGlobalIds.includes(node.globalId)) {
      return;
    }

    // Make request to save globalId for user.
    const success = await saveGlobalId(
      node.globalId,
      node.paperId,
      node.paperSectionId,
      node.paperSectionParagraphId
    );

    // Add the id.
    if (success) {
      setSavedGlobalIds([...savedGlobalIds, node.globalId]);
    }
  };

  const renderNode = (node: UBNode) => {
    switch (node.type) {
      case "paper": {
        return (
          <div key={node.globalId} className="mb-12 text-center">
            {parseInt(node.paperId) > 0 && (
              <p className="text-xl mb-2">Paper {node.paperId}</p>
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
        return (
          <div
            key={node.globalId}
            className="mb-6 text-left"
            id={node.globalId}
          >
            <div className="text-lg leading-relaxed">
              <div className="flex items-center justify-between block mb-2 text-gray-400 text-sm">
                <span>{node.globalId?.split(":")[1]}</span>
                <div className="flex items-center">
                  {expandedGlobalIds.includes(node.globalId) && (
                    <div className="flex items-center mr-2">
                      <button
                        className="bg-transparent border-none p-0 m-0 mr-2 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                        onClick={onExplainClick(node.globalId)}
                        type="button"
                      >
                        Explain
                      </button>
                      {session && (
                        <>
                          <span className="mr-2">|</span>
                          <button
                            className="bg-transparent border-none p-0 m-0 mr-2 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                            onClick={onCommentClick(node.globalId)}
                            type="button"
                          >
                            Comment
                          </button>
                        </>
                      )}
                      <span className="mr-2">|</span>
                      <button
                        className="bg-transparent border-none p-0 m-0 focus:outline-none mr-2 text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
                        onClick={onRelatedWorksClick(node.globalId)}
                        type="button"
                      >
                        Related
                      </button>
                      <span className="mr-2">|</span>
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
            <Link className="flex-1" href={`/papers/${prevPaperId}`}>
              ← {prevPaperId === 0 ? "Foreword" : `Paper ${prevPaperId}`}
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          <Link className="flex-1 text-center" href="/read">
            Table of Contents
          </Link>
          {nextPaperId ? (
            <Link className="flex-1 text-right" href={`/papers/${nextPaperId}`}>
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
            <Link href={`/papers/${prevPaperId}`}>← Paper {prevPaperId}</Link>
          ) : (
            <span />
          )}
          {nextPaperId ? (
            <Link href={`/papers/${nextPaperId}`}>Paper {nextPaperId} →</Link>
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
