// Node modules.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
// Relative modules.
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Spinner from "@/components/Spinner";
import { paperIdToUrl } from "@/utils/paperFormatters";

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

type CuratedQuote = {
  createdAt: string;
  globalId: string;
  paperId: string;
  sentAt: string;
  paper: {
    title: string;
  };
  paragraphNode: {
    htmlText: string;
    labels: string[];
    paperTitle: string;
    partId: string;
    sectionTitle: string;
    standardReferenceId: string;
    text: string;
  };
};

type TOCPageProps = {
  nodes: TOCNode[];
};

const ReadPage = ({ nodes }: TOCPageProps) => {
  // Hooks.
  const { status } = useSession();

  // State.
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [papersInProgress, setPapersInProgress] = useState<TOCNode[]>([]);
  const [papersYouMightLike, setPapersYouMightLike] = useState<TOCNode[]>([]);

  // Progress state.
  const [progressResults, setProgressResults] = useState<ProgressResult[]>([]);
  const [fetchingProgress, setFetchingProgress] = useState<boolean>(false);

  // User interests state.
  const [userInterests, setUserInterests] = useState<any[]>([]);
  const [fetchingUserInterests, setFetchingUserInterests] =
    useState<boolean>(false);

  // Add new state
  const [featuredQuotes, setFeaturedQuotes] = useState<CuratedQuote[]>([]);
  const [fetchingFeaturedQuotes, setFetchingFeaturedQuotes] = useState(false);

  useEffect(() => {
    if (userInterests.length > 0) {
      setPapersYouMightLike([...getRandomPapersForUser(nodes, userInterests)]);
      setPapersInProgress([
        ...getInProgressPapersForUser(nodes, progressResults),
      ]);
    }
  }, [userInterests, nodes, progressResults]);

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

  const fetchFeaturedQuotes = async () => {
    try {
      setFetchingFeaturedQuotes(true);
      const response = await fetch(
        "/api/curated-quotes?sent=true&randomAmount=2"
      );
      const data = await response.json();
      setFeaturedQuotes(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setFetchingFeaturedQuotes(false);
    }
  };

  const onAuthenticated = async () => {
    await Promise.all([
      fetchProgress(),
      fetchUserInterests(),
      fetchFeaturedQuotes(),
    ]);
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
          progressResult?.progress < 100 && progressResult?.progress > 0
      )
      .filter((progressResult) => {
        return allPapers.some(
          (paper) => paper.paperId === progressResult?.paperId
        );
      })
      .map((progressResult) => progressResult?.paperId);

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
    let papersMatchingInterests = allPapers.filter((paper) =>
      paper.labels.some((label) =>
        userInterests.some((interest) => interest.label.name === label)
      )
    );

    // Filter out papers that are already in progress.
    const paperIdsInProgress = progressResults
      .filter(
        (progressResult) =>
          progressResult?.progress < 100 && progressResult?.progress > 0
      )
      .map((progressResult) => progressResult?.paperId);
    papersMatchingInterests = papersMatchingInterests.filter(
      (paper) => !paperIdsInProgress.includes(paper.paperId as string)
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

  const deriveProgressBadge = (progressResult: ProgressResult | undefined) => {
    return (
      <>
        {/* Progress Bar */}
        {progressResult && progressResult?.progress < 100 && (
          <div className="flex items-center justify-center absolute -top-4 -right-3 h-8 w-8 bg-slate-400 text-white shadow-lg rounded-full dark:bg-neutral-200 dark:text-gray-600 text-xs">
            {progressResult.progress.toFixed(0)}%
          </div>
        )}

        {/* Completed Checkmark */}
        {progressResult && progressResult?.progress === 100 && (
          <div className="flex items-center justify-center absolute -top-4 -right-3 h-8 w-8 bg-green-400 text-white shadow-lg rounded-full dark:bg-green-400 dark:text-white text-xs">
            <svg className="w-4 h-4" viewBox="0 0 20 20">
              <path fill="currentColor" d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
            </svg>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        metaDescription="Explore the rich tapestry of wisdom within The Urantia Papers on UrantiaHub, discovering insights and teachings that resonate with you."
        titlePrefix="Explore"
      />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-4xl min-h-screen">
        {status === "loading" ? (
          <div className="mt-4 mb-4 text-center">
            <h1 className="text-5xl font-bold mb-8">Explore</h1>
            <Spinner />
          </div>
        ) : (
          <>
            <div className="mt-4 mb-4 text-center">
              <h1 className="text-5xl font-bold mb-8">Explore</h1>

              <div className="mb-8">
                <h2 className="text-base mb-2 pb-2 text-center border-b text-gray-400 border-gray-200 dark:border-gray-600">
                  Quotes
                </h2>

                <p className="text-xs text-gray-400 mb-6">
                  Discover the context behind some of the most inspiring
                  passages.
                </p>

                {fetchingFeaturedQuotes ? (
                  <div className="flex justify-center items-center">
                    <Spinner />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featuredQuotes?.map((quote) => {
                      const cleanHtml = quote.paragraphNode.htmlText.replace(
                        /\sclass="[^"]*"/g,
                        ""
                      );

                      return (
                        <Link
                          key={quote.globalId}
                          href={`/papers/${paperIdToUrl(`${quote.paperId}`)}#${
                            quote.globalId
                          }`}
                          className="relative flex flex-col items-start text-left px-6 pt-5 pb-10 bg-white dark:bg-neutral-700 hover:dark:bg-neutral-600 rounded transition-colors hover:no-underline hover:shadow-lg hover:dark:shadow-none transition-shadow duration-300"
                        >
                          {/* Paper Info */}
                          <div className="flex flex-col w-full mb-2">
                            <div className="text-xs text-gray-400 flex items-center justify-between w-full">
                              {quote.paperId === "0" ? (
                                "Foreword"
                              ) : (
                                <>
                                  <span>Paper {quote.paperId}</span>
                                  <span>Part {quote.paragraphNode.partId}</span>
                                </>
                              )}
                            </div>
                            <h3 className="mt-1 text-sm font-bold leading-5 text-gray-600 dark:text-white">
                              {quote.paragraphNode.paperTitle}{" "}
                              <span className="text-xs text-gray-400 font-normal">
                                ({quote.paragraphNode.standardReferenceId})
                              </span>
                            </h3>
                            {quote.paragraphNode.sectionTitle && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {quote.paragraphNode.sectionTitle}
                              </p>
                            )}
                          </div>

                          {/* Quote Text */}
                          <div className="flex-grow w-full overflow-hidden">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              <div
                                className="line-clamp-5"
                                dangerouslySetInnerHTML={{ __html: cleanHtml }}
                              />
                              <span className="text-sm text-blue-400 absolute bottom-3 right-3">
                                Read more
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

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
                    <div className="flex justify-center items-center papers-row">
                      <Spinner />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 papers-row">
                      {papersYouMightLike.map((paper) => {
                        // Find the progress result for the current paper and derive its completion status.
                        const progressResult = progressResults.find(
                          (progressResult) =>
                            progressResult?.paperId === paper.paperId
                        );

                        return (
                          <Link
                            key={paper.globalId}
                            href={`/papers/${paperIdToUrl(`${paper.paperId}`)}`}
                            className="relative flex flex-col items-start text-left justify-between px-4 py-2 mb-2 bg-white dark:bg-neutral-700 hover:dark:bg-neutral-600 rounded transition-colors hover:no-underline hover:shadow-lg hover:dark:shadow-none transition-shadow duration-300"
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

                              {deriveProgressBadge(progressResult)}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

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
                    <div className="flex justify-center items-center papers-row">
                      <Spinner />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 papers-row">
                      {papersInProgress.map((paper) => {
                        // Find the progress result for the current paper and derive its completion status.
                        const progressResult = progressResults.find(
                          (progressResult) =>
                            progressResult?.paperId === paper.paperId
                        );

                        return (
                          <Link
                            className="relative flex flex-col items-start text-left justify-between px-4 py-2 mb-2 bg-white dark:bg-neutral-700 hover:dark:bg-neutral-600 rounded transition-colors hover:no-underline hover:shadow-lg hover:dark:shadow-none transition-shadow duration-300"
                            href={`/papers/${paperIdToUrl(`${paper.paperId}`)}`}
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

                              {deriveProgressBadge(progressResult)}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
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
