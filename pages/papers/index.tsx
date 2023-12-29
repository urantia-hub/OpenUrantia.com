import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";

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
  // Function to render each part and its papers
  const renderPart = (
    parts: Part[],
    partId: string,
    index: number,
    partTitle?: string,
    partSponsorship?: string
  ) => {
    // Only render parts that have a paperId (filter out parts entries)
    const relevantPapers = parts.filter(
      (part) => part.partId === partId && part.paperId
    );

    if (relevantPapers.length === 0) return null; // No papers to render for this part

    return (
      <div key={partId} className="mb-8">
        {index > 0 && <hr className="my-8" />}
        <h2 className="text-3xl font-bold pt-4 mb-12 text-center">
          Part {partId}: {partTitle || `Part ${partId}`}
        </h2>
        <ul className="mt-6 pb-3">
          {relevantPapers.map((paper) => (
            <li key={paper.globalId} className="mb-2 flex items-baseline">
              <pre
                style={{ minWidth: "2rem" }}
                className="inline-block text-gray-400 text-sm mr-2"
              >
                {paper.paperId}.
              </pre>
              <Link
                className="text-xl hover:text-gray-300"
                href={`/papers/${paper.paperId}`}
              >
                {paper.paperTitle}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Extract parts and sort them by partId
  const sortedParts = partsData
    .filter((part) => part.type === "part")
    .sort((a, b) => parseInt(a.partId) - parseInt(b.partId));

  return (
    <div className="flex flex-col min-h-screen bg-neutral-800">
      <HeadTag titlePrefix="Table of Contents" />

      <Navbar />

      <main className="mt-6 flex-grow container mx-auto px-4 my-4 max-w-4xl">
        <h1 className="text-base mt-2 text-center">Table of Contents</h1>
        {sortedParts.map((part, index) =>
          renderPart(
            partsData,
            part.partId,
            index,
            part.partTitle,
            part.partSponsorship
          )
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
  const partsData = jsonData?.data?.results || [];

  return {
    props: {
      partsData,
    },
  };
}

export default ReadPage;
