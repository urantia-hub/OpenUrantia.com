// Node modules.
import Link from "next/link";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Header from "@/components/Header";
import Spinner from "@/components/Spinner";

type Result = {
  globalId: string;
  htmlText?: string;
  language: string;
  objectID: string;
  paperId: string;
  paperSectionId?: string;
  paperSectionParagraphId?: string;
  paperTitle: string;
  partId: string;
  sectionTitle?: string;
  text?: string;
  type: string;
};

type PaperPageProps = {
  paperData: {
    data: {
      results: Result[];
    };
  };
};

const PaperPage = ({ paperData }: PaperPageProps) => {
  if (!paperData) {
    // Display a loading or not found message
    return <Spinner />;
  }

  const renderNode = (node: Result) => {
    switch (node.type) {
      case "paper": {
        return (
          <div key={node.globalId} className="mb-12 text-center">
            <p className="text-xl mb-2">Paper {node.paperId}</p>
            <h1 className="text-4xl font-bold mb-12">{node.paperTitle}</h1>
          </div>
        );
      }
      case "section": {
        if (!node.sectionTitle) return null;
        return (
          <div key={node.globalId} className="mt-20 mb-12 text-center">
            <h2 className="text-3xl font-bold">{node.sectionTitle}</h2>
          </div>
        );
      }
      case "paragraph": {
        return (
          <div key={node.globalId} className="mb-6 text-left">
            <p className="text-lg leading-relaxed">
              <span className="text-gray-400 text-sm block mb-2">
                {node.globalId}
              </span>
              <span
                dangerouslySetInnerHTML={{ __html: node.htmlText as string }}
              />
            </p>
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
  const prevPaperId = currentPaperId > 1 ? currentPaperId - 1 : null;
  const nextPaperId = currentPaperId < 196 ? currentPaperId + 1 : null;

  // Page content
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <HeadTag
        metaDescription={nodes[0].paperTitle}
        titlePrefix={`Paper ${nodes[0].paperId} - ${nodes[0].paperTitle}`}
      />

      <Header />

      <main className="flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        {/* Navigation links for previous and next papers */}
        <div className="flex justify-between mt-1 mb-4">
          {prevPaperId ? (
            <Link className="flex-1" href={`/papers/${prevPaperId}`}>
              ← Paper {prevPaperId}
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
          {nodes.map((node: Result) => renderNode(node))}
        </div>

        {/* Navigation links for previous and next papers */}
        <div className="flex justify-between mb-12">
          {prevPaperId ? (
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

  // Fetch data from your API
  const res = await fetch(
    `${process.env.URANTIA_DEV_API_HOST}/api/v1/urantia-book/read?paperId=${paperId}`
  );
  const paperData = await res.json();

  return {
    props: {
      paperData,
    },
  };
}

export default PaperPage;
