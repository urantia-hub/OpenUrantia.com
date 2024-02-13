// Node modules.
import Link from "next/link";
import { useEffect, useState } from "react";
// Relative modules.
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import { paperLabels } from "@/utils/paperLabels";

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
  // State.
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [userInterests, setUserInterests] = useState<any[]>([]);
  const [topPapers, setTopPapers] = useState<TOCNode[]>([]);

  useEffect(() => {
    if (userInterests.length > 0) {
      setTopPapers(getRandomPapersForUser(nodes, userInterests));
    }
  }, [userInterests, nodes]);

  useEffect(() => {
    const fetchUserInterests = async () => {
      const response = await fetch("/api/user/interests");
      if (response.ok) {
        const data = await response.json();
        setUserInterests(data.userInterests);
      }
    };

    fetchUserInterests();
  }, []);

  // Function to get a random set of papers that match user interests
  const getRandomPapersForUser = (
    allPapers: TOCNode[],
    userInterests: any[],
    maxPapers: number = 6
  ) => {
    // Filter papers that match at least one user interest
    const papersMatchingInterests = allPapers.filter((paper) =>
      paper.labels.some((label) =>
        userInterests.some((interest) => interest.label.name === label)
      )
    );

    // Shuffle the array and take the first 'maxPapers' elements
    return papersMatchingInterests
      .sort(() => 0.5 - Math.random())
      .slice(0, maxPapers);
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
            <h2 className="text-sm mb-6 pb-2 text-center border-b text-gray-400 border-gray-600">
              Part {currentNode.partId}:{" "}
              {currentNode.partTitle || `Part ${currentNode.partId}`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {papers.map((paper) => (
                <Link
                  className="flex flex-col justify-between px-4 py-2 mb-2 bg-neutral-700 rounded hover:bg-neutral-600 transition-colors hover:no-underline"
                  href={`/papers/${paper.paperId}`}
                  key={paper.globalId}
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">
                      Paper {paper.paperId}
                    </span>
                    <h3 className="mt-1 text-lg font-bold">
                      {paper.paperTitle}
                    </h3>
                  </div>
                  <span
                    className="mt-1 text-xs text-gray-400 truncate w-full"
                    title={paper.labels.sort().join(" | ")}
                  >
                    {paper.labels.sort().join(" | ")}
                  </span>
                </Link>
              ))}
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
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
              <Link
                className="block px-4 py-2 bg-neutral-700 rounded hover:bg-neutral-600 transition-colors hover:no-underline"
                href={`/papers/${currentNode.paperId}`}
              >
                <span className="text-xs text-gray-400">Foreword</span>
                <h3 className="text-lg font-bold">{currentNode.paperTitle}</h3>
                <span className="text-xs text-gray-400 truncate">
                  {currentNode.labels.sort().join(" | ")}
                </span>
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
    <div className="flex flex-col min-h-screen bg-neutral-800">
      <HeadTag titlePrefix="Discover" />
      <Navbar />
      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-4xl">
        <div className="mt-4 mb-8 text-center">
          <h1 className="text-5xl font-bold mb-8">The Urantia Papers</h1>

          {/* -- Papers You Might Like --- */}
          {topPapers.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm mb-6 pb-2 text-center border-b text-gray-400 border-gray-600">
                Papers You Might Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topPapers.map((paper) => {
                  const highlightLabels = (
                    paperLabels: string[],
                    userInterests: any[]
                  ) => {
                    // Derive the labels that match user interests.
                    const matchingLabels = paperLabels.filter((label) =>
                      userInterests.some(
                        (userInterest) => userInterest.label.name === label
                      )
                    );

                    // Derive the labels that do not match user interests.
                    const nonMatchingLabels = paperLabels.filter(
                      (label) => !matchingLabels.includes(label)
                    );

                    // Return the matching labels in bold and the non-matching labels as is.
                    return [
                      ...matchingLabels.map(
                        (label) =>
                          `<span class="text-green-400">${label}</span>`
                      ),
                      ...nonMatchingLabels,
                    ];
                  };

                  return (
                    <Link
                      key={paper.globalId}
                      href={`/papers/${paper.paperId}`}
                      className="flex flex-col items-start text-left justify-between px-4 py-2 mb-2 bg-neutral-700 rounded hover:bg-neutral-600 transition-colors hover:no-underline"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">
                          Paper {paper.paperId}
                        </span>
                        <h3 className="mt-1 text-lg font-bold">
                          {paper.paperTitle}
                        </h3>
                      </div>
                      <span
                        className="mt-1 text-xs text-gray-400 truncate w-full"
                        title={paper.labels.sort().join(" | ")}
                        dangerouslySetInnerHTML={{
                          __html: highlightLabels(paper.labels, userInterests)
                            .sort()
                            .join(" | "),
                        }}
                      ></span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* -- All Papers --- */}
          <div className="mb-8">
            <h2 className="text-sm mb-6 pb-2 text-center border-b text-gray-400 border-gray-600">
              All Papers
            </h2>
          </div>

          {/* Render filter toggle buttons */}
          {showFilters ? (
            <>
              <button
                className="bg-white text-sm md:text-xs text-black py-1.5 px-4 shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out rounded-full"
                onClick={() => {
                  setShowFilters(false);
                  setActiveFilters([]);
                }}
              >
                Hide Filters
              </button>
              <div className="flex flex-wrap justify-center gap-2 mt-8 mb-4">
                {paperLabels.map((label) => (
                  <button
                    key={label}
                    className={`px-3 py-1 rounded-full text-sm md:text-xs font-semibold ${
                      activeFilters.includes(label)
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-600 text-neutral-300"
                    }`}
                    onClick={() => toggleFilter(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <button
                className="bg-white text-sm md:text-xs text-black py-1.5 px-4 shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out rounded-full"
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
