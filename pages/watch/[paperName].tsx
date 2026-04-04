import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { videoUrl, videoThumbnailUrl } from "@/utils/config";
import {
  getPaperIdFromPaperUrl,
  getValidPaperUrls,
  paperIdToUrl,
} from "@/utils/paperFormatters";

type WatchPageProps = {
  paperId: string;
  paperTitle: string;
  paperUrl: string;
  prevPaperUrl: string | null;
  nextPaperUrl: string | null;
};

const WatchPage = ({
  paperId,
  paperTitle,
  paperUrl,
  prevPaperUrl,
  nextPaperUrl,
}: WatchPageProps) => {
  const title =
    paperId === "0" ? "Foreword" : `Paper ${paperId}: ${paperTitle}`;

  const seoDescription = `Listen and read along with ${title} of The Urantia Book. AI-narrated with synced text overlay.`;

  return (
    <>
      <HeadTag
        titlePrefix={`Watch — ${title}`}
        metaDescription={seoDescription}
        canonicalUrl={`https://www.urantiahub.com/watch/${paperUrl}`}
      />

      <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-900">
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 pt-8 pb-16 flex-1">
          {/* Video Player */}
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video
              className="w-full h-full"
              controls
              autoPlay
              preload="metadata"
              poster={videoThumbnailUrl(paperId)}
              src={videoUrl(paperId)}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Title + Read Along */}
          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                The Urantia Book
              </p>
            </div>

            <Link
              href={`/papers/${paperUrl}`}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors shrink-0 mt-1"
            >
              <BookOpen className="w-4 h-4" />
              Read this paper
            </Link>
          </div>

          {/* Prev / Next Navigation */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-neutral-700 pt-5">
            {prevPaperUrl ? (
              <Link
                href={`/watch/${prevPaperUrl}`}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous paper
              </Link>
            ) : (
              <div />
            )}

            {nextPaperUrl ? (
              <Link
                href={`/watch/${nextPaperUrl}`}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Next paper
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export async function getStaticProps(context: any) {
  const { paperName } = context.params as { paperName: string };

  const validPaperUrls = getValidPaperUrls();

  if (!validPaperUrls.includes(paperName)) {
    const paperId = Number(paperName);
    if (!isNaN(paperId) && paperId >= 0 && paperId <= 196) {
      return {
        redirect: {
          destination: `/watch/${paperIdToUrl(String(paperId))}`,
          permanent: true,
        },
      };
    }
    return { notFound: true };
  }

  const paperId = getPaperIdFromPaperUrl(paperName);

  const { fetchPaper } = await import("@/libs/urantiaApi/client");
  let paperTitle = "";
  try {
    const paperData = await fetchPaper(String(paperId));
    const paperNode = paperData?.data?.results?.find(
      (n: any) => n.type === "paper"
    );
    paperTitle = paperNode?.paperTitle || `Paper ${paperId}`;
  } catch {
    paperTitle = `Paper ${paperId}`;
  }

  const id = Number(paperId);
  const prevPaperUrl = id > 0 ? paperIdToUrl(String(id - 1)) : null;
  const nextPaperUrl = id < 196 ? paperIdToUrl(String(id + 1)) : null;

  return {
    props: {
      paperId: String(paperId),
      paperTitle,
      paperUrl: paperName,
      prevPaperUrl,
      nextPaperUrl,
    },
  };
}

export async function getStaticPaths() {
  const prerenderedPaperIds = [0, 1, 2, 3, 4, 5];
  const paths = prerenderedPaperIds.map((paperId) => ({
    params: { paperName: paperIdToUrl(String(paperId)) },
  }));

  return { paths, fallback: "blocking" };
}

export default WatchPage;
