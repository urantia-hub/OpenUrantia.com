// Node modules.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
// Relative modules.
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import { paperLabels } from "@/utils/paperLabels";
import Spinner from "@/components/Spinner";

// Define the structure of the data you expect from the API
type TOCNode = {
  globalId: string;
  labels: string[];
  paperId?: string;
  paperTitle?: string;
  partId: string;
  partSponsorship?: string;
  partTitle?: string;
  type: string;
};

type TOCPageProps = {
  nodes: TOCNode[];
};

const ReadPage = ({ nodes }: TOCPageProps) => {
  // Hooks.
  const { status } = useSession();

  // State.
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [papersInProgress, setPapersInProgress] = useState<TOCNode[]>([]);
  const [papersYouMightLike, setPapersYouMightLike] = useState<TOCNode[]>([]);

  // Progress state.
  const [progressResults, setProgressResults] = useState<ProgressResult[]>([]);
  const [fetchingProgress, setFetchingProgress] = useState<boolean>(false);

  // User interests state.
  const [userInterests, setUserInterests] = useState<any[]>([]);
  const [fetchingUserInterests, setFetchingUserInterests] =
    useState<boolean>(false);

  useEffect(() => {
    if (userInterests.length > 0) {
      setPapersYouMightLike([...getRandomPapersForUser(nodes, userInterests)]);
      setPapersInProgress([
        ...getInProgressPapersForUser(nodes, progressResults),
      ]);
    }
  }, [userInterests, nodes, progressResults]);

  const fetchUserInterests = async () => {
    try {
      setFetchingUserInterests(true);
      const response = await fetch(`/api/user/interests`);
      const data = await response.json();

      // Check if the user has interests, if they have been redirected before, or if they skipped the selection
      if (
        data.userInterests?.length === 0 &&
        !sessionStorage.getItem("redirectedToInterests") &&
        !sessionStorage.getItem("skippedInterestsSelection")
      ) {
        sessionStorage.setItem("redirectedToInterests", "true");
        window.location.href = "/onboarding/interests"; // Redirect to the onboarding interests selection page
      } else {
        setUserInterests(data.userInterests);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetchingUserInterests(false);
    }
  };

  const fetchProgress = async () => {
    try {
      setFetchingProgress(true);
      const response = await fetch("/api/user/nodes/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setProgressResults(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setFetchingProgress(false);
    }
  };

  const onAuthenticated = async () => {
    await fetchUserInterests();
    await fetchProgress();
  };

  useEffect(() => {
    if (status === "authenticated") {
      void onAuthenticated();
    }
  }, [status]);

  const getInProgressPapersForUser = (
    allPapers: TOCNode[],
    progressResults: ProgressResult[],
    maxPapers: number = 3
  ): TOCNode[] => {
    const paperIds = progressResults
      .filter(
        (progressResult) =>
          progressResult.progress < 100 && progressResult.progress > 0
      )
      .filter((progressResult) => {
        return allPapers.some(
          (paper) => paper.paperId === progressResult.paperId
        );
      })
      .map((progressResult) => progressResult.paperId);

    const papersInProgress = allPapers.filter((paper) =>
      paperIds.includes(paper?.paperId as string)
    );

    return papersInProgress
      .sort(() => 0.5 - Math.random())
      .slice(0, maxPapers)
      .sort((a, b) => {
        if (a.paperId && b.paperId) {
          return parseInt(a.paperId) - parseInt(b.paperId);
        }
        return 0;
      });
  };

  // Function to get a random set of papers that match user interests
  const getRandomPapersForUser = (
    allPapers: TOCNode[],
    userInterests: any[],
    maxPapers: number = 3
  ) => {
    // Filter papers that match at least one user interest
    const papersMatchingInterests = allPapers.filter((paper) =>
      paper.labels.some((label) =>
        userInterests.some((interest) => interest.label.name === label)
      )
    );

    // Shuffle the array and take the first 'maxPapers' elements, then sort them by paperId (if there is a paperId).
    return papersMatchingInterests
      .sort(() => 0.5 - Math.random())
      .slice(0, maxPapers)
      .sort((a, b) => {
        if (a.paperId && b.paperId) {
          return parseInt(a.paperId) - parseInt(b.paperId);
        }
        return 0;
      });
  };

  // Function to handle filter toggle.
  const toggleFilter = (label: string) => {
    setActiveFilters(
      (currentFilters) =>
        currentFilters.includes(label)
          ? currentFilters.filter((filter) => filter !== label) // Remove filter if it's already active.
          : [...currentFilters, label] // Add filter if it's not active.
    );
  };

  // Function to determine if a paper should be shown based on active filters.
  const shouldShowPaper = (labels: string[]) => {
    // If no filters are active, all papers should be shown.
    if (activeFilters.length === 0) return true;

    // If a paper has no labels, it should not be shown.
    if (!labels) return false;

    // Otherwise, only show papers that match at least one active filter.
    return labels.some((label) => activeFilters.includes(label));
  };

  const highlightUserInterestLabels = (
    paperLabels: string[],
    userInterests: any[]
  ) => {
    // Derive the labels that match user interests.
    const matchingLabels = paperLabels.filter((label) =>
      userInterests.some((userInterest) => userInterest.label.name === label)
    );

    // Derive the labels that do not match user interests.
    const nonMatchingLabels = paperLabels.filter(
      (label) => !matchingLabels.includes(label)
    );

    // Return the matching labels in bold and the non-matching labels as is.
    return [
      ...matchingLabels.map((label) => `<span class="">${label}</span>`),
      ...nonMatchingLabels,
    ];
  };

  const highlightActiveFilterLabels = (
    paperLabels: string[],
    activeFilters: string[]
  ) => {
    // Derive the labels that match user interests.
    const matchingLabels = paperLabels.filter((label) =>
      activeFilters.includes(label)
    );

    // Derive the labels that do not match user interests.
    const nonMatchingLabels = paperLabels.filter(
      (label) => !matchingLabels.includes(label)
    );

    // Return the matching labels in bold and the non-matching labels as is.
    return [
      ...matchingLabels.map(
        (label) => `<span class="text-blue-400">${label}</span>`
      ),
      ...nonMatchingLabels,
    ];
  };

  // Function to render each part and its papers
  const renderNode = (currentNode: TOCNode) => {
    switch (currentNode.type) {
      case "part": {
        const papers = nodes.filter(
          (node) =>
            currentNode.partId === node.partId &&
            node.type === "paper" &&
            shouldShowPaper(node.labels)
        );

        if (!papers.length) return null;

        return (
          <div key={currentNode.globalId} className="mb-8">
            <h2 className="text-xs mb-6 pb-2 text-center border-b text-gray-400 border-gray-200 dark:border-gray-600">
              Part {currentNode.partId}:{" "}
              {currentNode.partTitle || `Part ${currentNode.partId}`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {papers.map((paper) => {
                // Derive progress result for the current paper.
                const progressResult = progressResults.find(
                  (progressResult) => progressResult.paperId === paper.paperId
                );
                const isCompleted = progressResult?.progress === 100;
                const isNotStarted = progressResult?.progress === 0;
                const progressClasses = isNotStarted
                  ? "bg-gray-200 dark:bg-zinc-600"
                  : isCompleted
                  ? "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
                  : "bg-gray-400 dark:bg-white";

                return (
                  <Link
                    className="flex flex-col justify-between px-4 py-2 mb-2 bg-white dark:bg-neutral-700 hover:dark:bg-neutral-600 rounded transition-colors hover:no-underline hover:shadow-lg hover:dark:shadow-none transition-shadow duration-300"
                    href={`/papers/${paper.paperId}`}
                    key={paper.globalId}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">
                        Paper {paper.paperId}
                      </span>
                      <h3 className="mt-1 text-lg font-bold leading-6 text-gray-600 dark:text-white">
                        {paper.paperTitle}
                      </h3>
                    </div>
                    <div className="flex flex-col">
                      <span
                        className="mt-1 text-xs text-gray-400 truncate w-full"
                        title={paper.labels.sort().join(" | ")}
                        dangerouslySetInnerHTML={{
                          __html: highlightActiveFilterLabels(
                            paper.labels,
                            activeFilters
                          )
                            .sort()
                            .join(" | "),
                        }}
                      />
                      {/* Progress */}
                      {progressResult && (
                        <div className="flex flex-col mt-1">
                          <div className="bg-gray-200 dark:bg-zinc-600 rounded-full h-2.5 w-full relative mb-1">
                            <div
                              className={`absolute h-2.5 rounded-full ${progressClasses}`}
                              style={{ width: `${progressResult.progress}%` }}
                            />
                          </div>
                          {progressResult.progress < 100 && (
                            <div className="text-xs mt-0.5 text-gray-400 dark:text-white">
                              Continue Reading{" "}
                              {progressResult.progress < 100
                                ? ` (${progressResult.progress.toFixed(0)}%)`
                                : ""}
                            </div>
                          )}
                          {progressResult.progress === 100 && (
                            <div className="text-green-500 dark:text-green-400 text-xs">
                              Completed (100%)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      }
      case "paper": {
        // Foreword is a special case; handle it separately.
        if (
          currentNode.paperId === "0" &&
          shouldShowPaper(currentNode.labels)
        ) {
          // Derive progress result for the current paper.
          const progressResult = progressResults.find(
            (progressResult) => progressResult.paperId === currentNode.paperId
          );
          const isCompleted = progressResult?.progress === 100;
          const isNotStarted = progressResult?.progress === 0;
          const progressClasses = isNotStarted
            ? "bg-gray-200 dark:bg-zinc-600"
            : isCompleted
            ? "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
            : "bg-gray-400 dark:bg-white";

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
              <Link
                className="block px-4 py-2 bg-white dark:bg-neutral-700 hover:dark:bg-neutral-600 rounded transition-colors hover:no-underline hover:shadow-lg hover:dark:shadow-none transition-shadow duration-300"
                href={`/papers/${currentNode.paperId}`}
              >
                <span className="text-xs text-gray-400">Foreword</span>
                <h3 className="text-lg font-bold text-gray-600 dark:text-white">
                  {currentNode.paperTitle}
                </h3>
                <span
                  className="text-xs text-gray-400 truncate"
                  title={currentNode.labels.sort().join(" | ")}
                  dangerouslySetInnerHTML={{
                    __html: highlightActiveFilterLabels(
                      currentNode.labels,
                      activeFilters
                    )
                      .sort()
                      .join(" | "),
                  }}
                />
                {/* Progress */}
                {progressResult && (
                  <div className="flex flex-col mt-1">
                    <div className="bg-gray-200 dark:bg-zinc-600 rounded-full h-2.5 w-full relative mb-1">
                      <div
                        className={`absolute h-2.5 rounded-full ${progressClasses}`}
                        style={{ width: `${progressResult.progress}%` }}
                      />
                    </div>
                    {progressResult.progress < 100 && (
                      <div className="text-xs mt-0.5 text-gray-400 dark:text-white">
                        Continue Reading{" "}
                        {progressResult.progress < 100
                          ? ` (${progressResult.progress.toFixed(0)}%)`
                          : ""}
                      </div>
                    )}
                    {progressResult.progress === 100 && (
                      <div className="text-green-500 dark:text-green-400 text-xs">
                        Completed (100%)
                      </div>
                    )}
                  </div>
                )}
              </Link>
            </div>
          );
        }
        break;
      }
      default:
        return null;
    }
  };

  // Extract parts and sort them by partId
  const foreword = nodes.find((node) => node.paperId === "0");
  const sortedNodes = nodes
    .filter((node) => node.type === "part")
    .sort((a, b) => parseInt(a.partId) - parseInt(b.partId));

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        metaDescription="Explore the rich tapestry of wisdom within The Urantia Papers on OpenUrantia, discovering insights and teachings that resonate with you."
        titlePrefix="Discover"
      />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-4xl">
        {status === "loading" ? (
          <div className="mt-4 mb-4 text-center">
            <h1 className="text-5xl font-bold mb-8">The Urantia Papers</h1>
            <Spinner />
          </div>
        ) : (
          <>
            <div className="mt-4 mb-4 text-center">
              <h1 className="text-5xl font-bold mb-8">The Urantia Papers</h1>

              {/* -- Papers In Progress --- */}
              {!fetchingProgress && papersInProgress.length === 0 ? null : (
                <div className="mb-8">
                  <h2 className="text-base mb-2 pb-2 text-center border-b text-gray-400 border-gray-200 dark:border-gray-600">
                    Papers You&apos;re Reading
                  </h2>

                  <p className="text-xs text-gray-400 mb-6">
                    (View all{" "}
                    <Link
                      className="text-blue-400 hover:underline"
                      href="/progress"
                    >
                      papers you&apos;re reading
                    </Link>
                    . )
                  </p>

                  {fetchingProgress ? (
                    <div
                      className="flex justify-center items-center"
                      style={{ minHeight: "152px" }}
                    >
                      <Spinner />
                    </div>
                  ) : (
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      style={{ minHeight: "152px" }}
                    >
                      {papersInProgress.map((paper) => {
                        // Find the progress result for the current paper and derive its completion status.
                        const progressResult = progressResults.find(
                          (progressResult) =>
                            progressResult.paperId === paper.paperId
                        );
                        const isCompleted = progressResult?.progress === 100;
                        const isNotStarted = progressResult?.progress === 0;
                        const progressClasses = isNotStarted
                          ? "bg-gray-200 dark:bg-zinc-600"
                          : isCompleted
                          ? "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
                          : "bg-gray-400 dark:bg-white";

                        return (
                          <Link
                            className="flex flex-col items-start text-left justify-between px-4 py-2 mb-2 bg-white dark:bg-neutral-700 hover:dark:bg-neutral-600 rounded transition-colors hover:no-underline hover:shadow-lg hover:dark:shadow-none transition-shadow duration-300"
                            href={`/papers/${paper.paperId}`}
                            key={paper.globalId}
                          >
                            <div className="flex flex-col w-full">
                              {/* Top Row */}
                              <div className="text-xs text-gray-400 flex items-center justify-between w-full">
                                {paper.paperId === "0" ? (
                                  "Foreword"
                                ) : (
                                  <>
                                    <span>Paper {paper.paperId}</span>{" "}
                                    <span>Part {paper.partId}</span>
                                  </>
                                )}
                              </div>

                              {/* Paper Title */}
                              <h3 className="mt-1 text-lg font-bold leading-6 text-gray-600 dark:text-white">
                                {paper.paperTitle}
                              </h3>
                            </div>

                            <div className="flex flex-col w-full">
                              {/* Labels */}
                              <span
                                className="mt-1 text-xs text-gray-400 truncate w-full"
                                title={paper.labels.sort().join(" | ")}
                                dangerouslySetInnerHTML={{
                                  __html: highlightUserInterestLabels(
                                    paper.labels,
                                    userInterests
                                  )
                                    .sort()
                                    .join(" | "),
                                }}
                              />

                              {/* Progress */}
                              {progressResult && (
                                <div className="flex flex-col mt-2 w-full">
                                  <div className="bg-gray-200 dark:bg-zinc-600 rounded-full h-2.5 w-full relative mb-1">
                                    <div
                                      className={`absolute h-2.5 rounded-full ${progressClasses}`}
                                      style={{
                                        width: `${progressResult.progress}%`,
                                      }}
                                    />
                                  </div>
                                  {progressResult.progress < 100 && (
                                    <div className="text-xs mt-0.5 text-gray-400 dark:text-white">
                                      Continue Reading{" "}
                                      {progressResult.progress < 100 ? (
                                        <>
                                          {" "}
                                          <span className="text-gray-400">
                                            (
                                            {progressResult.progress.toFixed(0)}
                                            %)
                                          </span>
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  )}
                                  {progressResult.progress === 100 && (
                                    <div className="text-green-500 dark:text-green-400 text-xs">
                                      Completed (100%)
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* -- Papers You Might Like --- */}
              {!fetchingUserInterests &&
              papersYouMightLike.length === 0 ? null : (
                <div className="mb-8">
                  <h2 className="text-base mb-2 pb-2 text-center border-b text-gray-400 border-gray-200 dark:border-gray-600">
                    Papers You Might Like
                  </h2>

                  <p className="text-xs text-gray-400 mb-6">
                    (Suggestions based on{" "}
                    <Link
                      className="text-blue-400 hover:underline"
                      href="/onboarding/interests"
                    >
                      your interests
                    </Link>
                    .)
                  </p>

                  {fetchingUserInterests ? (
                    <div
                      className="flex justify-center items-center"
                      style={{ minHeight: "152px" }}
                    >
                      <Spinner />
                    </div>
                  ) : (
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      style={{ minHeight: "152px" }}
                    >
                      {papersYouMightLike.map((paper) => {
                        // Find the progress result for the current paper and derive its completion status.
                        const progressResult = progressResults.find(
                          (progressResult) =>
                            progressResult.paperId === paper.paperId
                        );
                        const isCompleted = progressResult?.progress === 100;
                        const isNotStarted = progressResult?.progress === 0;
                        const progressClasses = isNotStarted
                          ? "bg-gray-200 dark:bg-zinc-600"
                          : isCompleted
                          ? "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
                          : "bg-gray-400 dark:bg-white";

                        return (
                          <Link
                            key={paper.globalId}
                            href={`/papers/${paper.paperId}`}
                            className="flex flex-col items-start text-left justify-between px-4 py-2 mb-2 bg-white dark:bg-neutral-700 hover:dark:bg-neutral-600 rounded transition-colors hover:no-underline hover:shadow-lg hover:dark:shadow-none transition-shadow duration-300"
                          >
                            <div className="flex flex-col w-full">
                              <div className="text-xs text-gray-400 flex items-center justify-between w-full">
                                {paper.paperId === "0" ? (
                                  "Foreword"
                                ) : (
                                  <>
                                    <span>Paper {paper.paperId}</span>{" "}
                                    <span>Part {paper.partId}</span>
                                  </>
                                )}
                              </div>
                              <h3 className="mt-1 text-lg font-bold leading-6 text-gray-600 dark:text-white">
                                {paper.paperTitle}
                              </h3>
                            </div>
                            <div className="flex flex-col w-full">
                              <span
                                className="mt-1 text-xs text-gray-400 truncate w-full"
                                title={paper.labels.sort().join(" | ")}
                                dangerouslySetInnerHTML={{
                                  __html: highlightUserInterestLabels(
                                    paper.labels,
                                    userInterests
                                  )
                                    .sort()
                                    .join(" | "),
                                }}
                              />
                              {/* Progress */}
                              {progressResult && (
                                <div className="flex flex-col mt-2 w-full">
                                  <div className="bg-gray-200 dark:bg-zinc-600 rounded-full h-2.5 w-full relative mb-1">
                                    <div
                                      className={`absolute h-2.5 rounded-full ${progressClasses}`}
                                      style={{
                                        width: `${progressResult.progress}%`,
                                      }}
                                    />
                                  </div>
                                  {progressResult.progress < 100 && (
                                    <div className="text-xs mt-0.5 text-gray-400 dark:text-white">
                                      Continue Reading{" "}
                                      {progressResult.progress < 100 ? (
                                        <>
                                          {" "}
                                          <span className="text-gray-400">
                                            (
                                            {progressResult.progress.toFixed(0)}
                                            %)
                                          </span>
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  )}
                                  {progressResult.progress === 100 && (
                                    <div className="text-green-500 dark:text-green-400 text-xs">
                                      Completed (100%)
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* -- All Papers --- */}
              <h2 className="text-base pb-2 text-center border-b text-gray-400 border-gray-200 dark:border-gray-600">
                All Papers
              </h2>

              {/* Render filter toggle buttons */}
              {showFilters ? (
                <>
                  <button
                    className="px-3 py-1 rounded text-sm md:text-xs font-semibold bg-white text-gray-600 dark:bg-neutral-600 dark:text-neutral-300 border-0 mt-4 shadow-lg"
                    onClick={() => {
                      setShowFilters(false);
                      setActiveFilters([]);
                    }}
                  >
                    Hide Filters
                  </button>
                  <div className="flex flex-wrap gap-2 mt-4 mb-4">
                    {paperLabels.map((label) => (
                      <button
                        key={label}
                        className={`px-3 py-1 rounded text-sm md:text-xs font-semibold ${
                          activeFilters.includes(label)
                            ? "bg-blue-400 text-white dark:bg-blue-600 dark:text-white"
                            : "bg-white text-gray-400 dark:bg-neutral-600 dark:text-neutral-300"
                        } border-0 hover:shadow-lg transition-shadow duration-300`}
                        onClick={() => toggleFilter(label)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex justify-center mt-4">
                  <button
                    className="px-3 py-1 rounded text-sm md:text-xs font-semibold bg-white text-gray-400 dark:bg-neutral-600 dark:text-neutral-300 border-0 shadow-lg"
                    onClick={() => setShowFilters(true)}
                  >
                    Filter by Topics
                  </button>
                </div>
              )}
            </div>

            {/* Render parts and papers */}
            {foreword && renderNode(foreword)}
            {sortedNodes.map((node) => renderNode(node))}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export async function getStaticProps() {
  // Fetch data from your API
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/api/v1/urantia-book/toc`
  );
  const jsonData = await res.json();
  const nodes = jsonData?.data?.results || [];

  return {
    props: {
      nodes,
    },
  };
}

export default ReadPage;
