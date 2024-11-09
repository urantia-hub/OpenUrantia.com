// Node modules.
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Timeline from "@/components/Timeline";
import timelines from "@/data/timelines";

const TimelinePage = () => {
  // Hooks.
  const { status } = useSession();
  const router = useRouter();

  // Derive the timeline from the query string.
  const { timeline } = router.query;

  if (!timeline || Array.isArray(timeline)) {
    return <div>Invalid timeline</div>;
  }

  const data = timelines[timeline as "origin-of-urantia"];

  // if (status === "unauthenticated") {
  //   router.replace("/auth/sign-in");
  //   return null;
  // }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        metaDescription="Explore the timeline of Urantia from its origin to the present day."
        titlePrefix="Timeline"
      />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        <h1 className="text-2xl md:text-4xl dark:text-white font-bold mb-8 text-center">
          Timeline
        </h1>
        <div className="flex flex-col w-full">
          {data ? (
            <Timeline events={data.events} />
          ) : (
            <div className="text-center">
              <p className="text-lg mb-2">Timeline not found</p>
              <Link href="/timelines" className="text-blue-500">
                Explore other timelines
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TimelinePage;
