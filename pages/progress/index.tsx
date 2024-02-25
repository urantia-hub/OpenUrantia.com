// Node modules.
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import PaperCard from "@/components/PaperCard";
import Spinner from "@/components/Spinner";

const Progress = () => {
  // Session.
  const { status } = useSession();

  // Progress state.
  const [progressResults, setProgressResults] = useState<ProgressResult[]>([]);
  const [fetchingProgress, setFetchingProgress] = useState<boolean>(true);

  // Redirect to homepage if not logged in.
  useEffect(() => {
    if (status !== "authenticated" && status !== "loading") {
      window.location.href = "/";
    }
  }, [status]);

  // Fetch progress data on component mount.
  useEffect(() => {
    const fetchProgress = async () => {
      try {
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

    void fetchProgress();
  }, []);

  const renderPapers = () => {
    if (!progressResults?.length) {
      return null;
    }

    return progressResults.map((paper, index) => {
      return (
        <PaperCard
          nextGlobalId={paper.nextGlobalId}
          key={index}
          paperId={paper.paperId}
          paperTitle={paper.paperTitle}
          progress={paper.progress}
        />
      );
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-800 text-white">
      <HeadTag
        metaDescription="Track your reading progress on OpenUrantia and set personal goals to deepen your engagement with the teachings of The Urantia Papers."
        titlePrefix="Progress"
      />

      <Navbar />

      <main className="mt-12 flex-grow container mx-auto px-4 my-4 max-w-4xl">
        <h1 className="text-5xl font-bold mb-14 text-center">Progress</h1>
        {fetchingProgress && <Spinner />}
        {progressResults?.length ? (
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderPapers()}
            </div>
          </div>
        ) : null}
        {!fetchingProgress && !progressResults?.length ? (
          <div className="text-center">
            <p className="text-2xl font-bold mb-4">
              You haven&apos;t started any papers yet!
            </p>
            <p className="text-xl">
              <Link
                className="text-blue-400 hover:text-blue-300"
                href="/papers"
              >
                Browse papers
              </Link>
            </p>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default Progress;
