import { NextPage } from "next";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ChangelogEntry {
  date: string;
  version: string;
  changes: string[];
}

const changelog: ChangelogEntry[] = [
  {
    date: "2025-01-18",
    version: "1.0.1",
    changes: ["Updated copy-paste formatting for text selection"],
  },
  {
    date: "2025-01-18",
    version: "1.0.0",
    changes: [
      "Launched modern reading experience with audio playback",
      "Added AI-powered explanations for complex passages",
      "Implemented reading progress tracking",
      "Added note-taking and bookmarking system",
      "Introduced dark mode for comfortable reading",
    ],
  },
];

const Changelog: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        titlePrefix="Latest Updates"
        metaDescription="Track the latest features and improvements to Urantia Hub"
      />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl min-h-screen">
        <div className="mt-4 mb-4 text-center">
          <h1 className="text-5xl font-bold mb-8">Latest Updates</h1>
        </div>

        <div className="space-y-6">
          {changelog.map((entry) => (
            <div
              key={entry.version}
              className="bg-white dark:bg-neutral-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6"
            >
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-600 dark:text-white">
                  v{entry.version}
                </h2>
                <span className="text-sm text-gray-400">{entry.date}</span>
              </div>
              <ul className="space-y-2">
                {entry.changes.map((change, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
                  >
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full flex-shrink-0" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Changelog;
