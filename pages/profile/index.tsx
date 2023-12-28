// Node modules.
import React, { useState, useEffect, useRef } from "react";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import PaperCard from "@/components/PaperCard";
import Spinner from "@/components/Spinner";

const Profile = () => {
  // Progress state.
  const [progressResults, setProgressResults] = useState<ProgressResult[]>([]);
  const [fetchingProgress, setFetchingProgress] = useState<boolean>(true);

  // Reading refs.
  const nextReadRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (nextReadRef.current) {
      nextReadRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center", // Aligns to the center of the screen
      });
    }
  }, [progressResults]);

  const renderPapers = () => {
    if (!progressResults.length) {
      return null;
    }

    // Determine the next paper to read
    const nextPaperToRead = progressResults.find(
      (progressResult) => progressResult.progress < 100
    );

    // Determine the first unread global id.
    const firstUnreadGlobalId = nextPaperToRead?.unreadGlobalIds[0];

    return progressResults.map((paper, index) => (
      <PaperCard
        firstUnreadGlobalId={firstUnreadGlobalId}
        isNextRead={nextPaperToRead?.paperId === paper.paperId}
        key={index}
        paperId={paper.paperId}
        paperTitle={paper.paperTitle}
        progress={paper.progress}
        ref={
          nextPaperToRead?.paperId === paper.paperId ? nextReadRef : undefined
        }
      />
    ));
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-800 text-white">
      <HeadTag titlePrefix="Profile" />

      <Navbar />

      <main className="mt-28 flex-grow container mx-auto px-4 py-10">
        <section className="text-center space-y-6">
          <h1 className="text-3xl font-bold">My Progress</h1>
          {fetchingProgress ? (
            <Spinner />
          ) : (
            <div className="flex flex-wrap justify-center">
              {renderPapers()}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
