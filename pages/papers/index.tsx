// Node modules.
import Link from "next/link";
import { useState } from "react";
// Relative modules.
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import { paperLabels, paperLabelsLookup } from "@/utils/paperLabels";

// Define the structure of the data you expect from the API
type Part = {
  partId: string;
  paperId?: string;
  paperTitle?: string;
  partTitle?: string;
  partSponsorship?: string;
  globalId: string;
  type: string;
};

type TOCPageProps = {
  partsData: Part[];
};

const ReadPage = ({ partsData }: TOCPageProps) => {
  // State.
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);

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
  const shouldShowPaper = (paperId: string) => {
    const labels = paperLabelsLookup[paperId as keyof typeof paperLabelsLookup];

    // If no filters are active, all papers should be shown.
    if (activeFilters.length === 0) return true;

    // If a paper has no labels, it should not be shown.
    if (!labels) return false;

    // Otherwise, only show papers that match at least one active filter.
    return labels.some((label) => activeFilters.includes(label));
  };

  // Function to render each part and its papers
  const renderNode = (node: Part) => {
    switch (node.type) {
      case "part": {
        const papers = partsData.filter(
          (paper) =>
            paper.partId === node.partId &&
            paper.type === "paper" &&
            shouldShowPaper(paper.paperId as string)
        );

        if (!papers.length) return null;

        return (
          <div key={node.globalId} className="mb-8">
            <h2 className="text-sm mb-6 text-center border-b text-gray-400 border-gray-600">
              Part {node.partId}: {node.partTitle || `Part ${node.partId}`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {papers.map((paper) => (
                <Link
                  className="block px-4 pt-2 pb-4 mb-4 bg-neutral-700 rounded hover:bg-neutral-600 transition-colors hover:no-underline"
                  href={`/papers/${paper.paperId}`}
                  key={paper.globalId}
                >
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Paper {paper.paperId}</span>
                    <span>
                      {paperLabelsLookup[
                        paper.paperId as keyof typeof paperLabelsLookup
                      ]
                        .sort()
                        .join(", ")}
                    </span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold">{paper.paperTitle}</h3>
                </Link>
              ))}
            </div>
          </div>
        );
      }
      case "paper": {
        // Foreword is a special case; handle it separately.
        if (node.paperId === "0" && shouldShowPaper(node.paperId as string)) {
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
              <Link
                className="block px-4 pt-2 pb-4  bg-neutral-700 rounded hover:bg-neutral-600 transition-colors hover:no-underline"
                href={`/papers/${node.paperId}`}
              >
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Foreword</span>
                  <span>
                    {paperLabelsLookup[
                      node.paperId as keyof typeof paperLabelsLookup
                    ]
                      .sort()
                      .join(", ")}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{node.paperTitle}</h3>
              </Link>
            </div>
          );
        }
        break;
      }
      // You can add more cases if there are other node types
      default:
        return null;
    }
  };

  // Extract parts and sort them by partId
  const foreword = partsData.find((part) => part.paperId === "0");
  const sortedParts = partsData
    .filter((part) => part.type === "part")
    .sort((a, b) => parseInt(a.partId) - parseInt(b.partId));

  return (
    <div className="flex flex-col min-h-screen bg-neutral-800">
      <HeadTag titlePrefix="Table of Contents" />
      <Navbar />
      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-4xl">
        <div className="mt-4 mb-8 text-center">
          <h1 className="text-5xl font-bold mb-8">The Urantia Papers</h1>

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
        {sortedParts.map((part) => renderNode(part))}
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
  const partsData = jsonData?.data?.results || [];

  return {
    props: {
      partsData,
    },
  };
}

export default ReadPage;
