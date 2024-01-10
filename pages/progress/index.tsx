// Node modules.
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

    return progressResults.map((paper, index) => (
      <PaperCard
        nextGlobalId={paper.nextGlobalId}
        key={index}
        paperId={paper.paperId}
        paperTitle={paper.paperTitle}
        progress={paper.progress}
      />
    ));
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-800 text-white">
      <HeadTag titlePrefix="Progress" />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-4xl">
        <h1 className="text-5xl font-bold mb-8 text-center">Progress</h1>
        {fetchingProgress ? (
          <Spinner />
        ) : (
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderPapers()}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Progress;
